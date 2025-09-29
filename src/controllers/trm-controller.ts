import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import SFTPClient from "ssh2-sftp-client";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { pool } from "../config/db";
import { pickFields, extractRecords } from "../utils/dataHelpers";
import TrmFileModel from "../models/trm-model";
dotenv.config();

interface TRMRecordMapped {
  VIR_Number?: string;
  BL_Number?: string;
  GD_Number?: string;
  Total_Records?: number;
  Record_Sequence?: number;
  [key: string]: any;
}

interface DatasetRow {
  date: Date;
  iso: string;
  filename: string;
  json: TRMRecordMapped | { error: string };
}

const {
  SFTP_HOST = "10.10.60.4",
  SFTP_PORT = "22",
  SFTP_USER = "ftpuser",
  SFTP_PASS = "ftp@2025",
  SFTP_KEY_PATH,
  SFTP_REMOTE_DIR = "/home/ftpuser/TRM",
  SAVE_DATASET, // optional: persist dataset JSON after each call
} = process.env;

const RX = /^TRM_(\d{8})_(\d{4})\.xml$/i;

// Helper function to get the current timestamp in the format YYYYMMDDHHMM
function getCurrentTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}`;
}

// Function to create the ACK XML in the expected format
function createAckXml(filename: string): string {
  const performed = getCurrentTimestamp(); // Get the current timestamp in the desired format
  const ackData = {
    NewDataSet: {
      Table: {
        "#element": {
          Sender: "PSW",
          Receiver: "SHA",
          Message_Id_Prefix: "ACK",
          File_Name: filename,
          Status: "OK",
          File_Error_Code: "",
          Performed: performed,
        },
      },
    },
  };

  // Create the XML with the structure you need
  const builder = new XMLBuilder({
    format: true, // Format the XML for readability
    ignoreAttributes: true, // Don't use attributes
    processEntities: false,
    suppressEmptyNode: true, // This will help with empty File_Error_Code tag
  });

  let xmlContent = builder.build(ackData);

  // Clean up the XML to match exact format
  xmlContent = xmlContent
    .replace(/<Table #element>/g, "<Table>")
    .replace(/<\/#element>/g, "")
    .replace(/<File_Error_Code><\/File_Error_Code>/g, "<File_Error_Code />");

  return xmlContent;
}

// Function to save the ACK file to a local directory
function saveAckToFile(filename: string): string {
  const ackXml = createAckXml(filename);
  const ackFilename = `ACK_${filename}`;
  const ackFilePath = path.join(__dirname, "acknowledgments", ackFilename); // Path to save the file

  // Check if the directory exists, and if not, create it
  const dir = path.dirname(ackFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true }); // Create the directory recursively if it doesn't exist
  }

  // Write the acknowledgment XML to a local file
  fs.writeFileSync(ackFilePath, ackXml, "utf8");

  return ackFilePath;
}

// Deduplication logic
function normStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim().toUpperCase();
}

function dedupeDataset(dataset: DatasetRow[]): DatasetRow[] {
  const seen = new Set<string>();
  const out: DatasetRow[] = [];

  for (const row of dataset) {
    const j: any = row.json;
    if (!j || typeof j !== "object" || "error" in j) {
      out.push(row);
      continue;
    }

    const vir = normStr(j.VIR_Number);
    const bl = normStr(j.BL_Number);
    const gd = normStr(j.GD_Number);
    const filename = row.filename;

    if (vir && bl && gd) {
      const key = `${vir}|${bl}|${gd}|${filename}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
    }

    out.push(row);
  }

  return out;
}

// ───────────── Dataset Builder ─────────────
async function buildDataset(): Promise<DatasetRow[]> {
  const sftp = await openSftp();
  const selected: Array<{ date: Date; iso: string; name: string }> = [];

  try {
    const entries = await sftp.list(SFTP_REMOTE_DIR);

    // Select all files in the directory
    for (const e of entries) {
      const m = RX.exec(e.name);
      if (!m) continue;

      const ymdStr = m[1],
        hm = m[2];
      const date = new Date(
        `${ymdStr.slice(0, 4)}-${ymdStr.slice(4, 6)}-${ymdStr.slice(
          6,
          8
        )}T00:00:00Z`
      );
      const iso = `${ymdStr.slice(0, 4)}-${ymdStr.slice(4, 6)}-${ymdStr.slice(
        6,
        8
      )}T${hm.slice(0, 2)}:${hm.slice(2, 4)}:00Z`;
      selected.push({ date, iso, name: e.name });
    }

    if (selected.length === 0) {
      return [];
    }

    selected.sort(
      (a, b) =>
        a.date.getTime() - b.date.getTime() ||
        a.iso.localeCompare(b.iso) ||
        a.name.localeCompare(b.name)
    );

    const dataset: DatasetRow[] = [];
    for (const f of selected) {
      const remotePath = `${SFTP_REMOTE_DIR}/${f.name}`;
      try {
        const buf = await sftp.get(remotePath);
        const xml = Buffer.isBuffer(buf) ? buf.toString("utf-8") : String(buf);

        // Parse the XML content to JSON
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "",
          allowBooleanAttributes: true,
          trimValues: true,
          parseTagValue: true,
        });
        const parsedJson = parser.parse(xml);

        const records = parsedJson.NewDataSet.Table;
        if (records && records.length > 0) {
          for (let i = 0; i < records.length; i++) {
            const record = records[i];

            // Map the record to the desired format (assuming `pickFields` does this)
            const mapped = pickFields(record);

            // Add more fields if necessary
            if (mapped.Total_Records == null)
              mapped.Total_Records = records.length;
            if (mapped.Record_Sequence == null) mapped.Record_Sequence = i + 1;

            dataset.push({
              date: f.date,
              iso: f.iso,
              filename: f.name,
              json: mapped,
            });
          }
        } else {
          dataset.push({
            date: f.date,
            iso: f.iso,
            filename: f.name,
            json: { error: "No records found in XML." },
          });
        }
      } catch (err: any) {
        dataset.push({
          date: f.date,
          iso: f.iso,
          filename: f.name,
          json: {
            error: `Failed to read/parse: ${err?.message || String(err)}`,
          },
        });
      }

      // After processing each file, insert the data into DB and send acknowledgment
      const deduped = dedupeDataset(dataset);
      await saveDatasetToDb(deduped);

      // Create the ACK XML file and upload it to SFTP after processing each file
      const ackFilePath = saveAckToFile(f.name); // Save ACK file for the current TRM file
      await uploadAckToSftp(ackFilePath); // Upload ACK file to SFTP

      // Move processed file to Logs folder
      await moveToLogs(sftp, f.name);
    }

    return dataset;
  } catch (error) {
    console.error("Error building dataset:", error);
    throw error;
  } finally {
    try {
      await sftp.end();
    } catch (err) {
      console.error("Failed to close SFTP connection:", err);
    }
  }
}

// Function to upload the ACK file to the SFTP server
async function uploadAckToSftp(ackFilePath: string): Promise<void> {
  const sftp = new SFTPClient();
  const cfg: any = {
    host: "10.10.60.4", // Replace with your SFTP host
    port: 22,
    username: "ftpuser", // Replace with your SFTP username
    password: "ftp@2025", // Replace with your SFTP password
  };

  try {
    await sftp.connect(cfg);
    console.log("SFTP connection successful");

    // Upload the acknowledgment file to the remote server in the specified directory
    await sftp.put(
      ackFilePath,
      `/home/ftpuser/ACK_RECEIVE/${path.basename(ackFilePath)}`
    );
    console.log(`Uploaded ${ackFilePath} to SFTP server successfully!`);
  } catch (err) {
    console.error("Failed to upload ACK file to SFTP:", err);
    throw err;
  } finally {
    sftp.end(); // Close the SFTP connection
  }
}

// Function to save dataset to DB
async function saveDatasetToDb(dataset: DatasetRow[]): Promise<void> {
  const client = await pool.connect();
  try {
    console.log("Inserting data into the database...");
    for (const row of dataset) {
      if (row.json && !("error" in row.json)) {
        const { VIR_Number, BL_Number, GD_Number } = row.json;

        // Check if the record with the same BL_Number, GD_Number, and VIR_Number already exists
        const result = await client.query(
          `SELECT 1 FROM trm_files WHERE json_data->>'VIR_Number' = $1 AND json_data->>'BL_Number' = $2 AND json_data->>'GD_Number' = $3 LIMIT 1`,
          [VIR_Number, BL_Number, GD_Number]
        );

        if (result?.rowCount && result.rowCount > 0) {
          console.log(
            `Skipping record with VIR_Number: ${VIR_Number}, BL_Number: ${BL_Number}, GD_Number: ${GD_Number}`
          );
          continue;
        }

        console.log("Inserting into DB:", row);
        await client.query(
          `INSERT INTO trm_files (date, iso, filename, json_data) VALUES ($1, $2, $3, $4)`,
          [row.date, row.iso, row.filename, JSON.stringify(row.json)]
        );
      }
    }
  } catch (error) {
    console.error("Error saving dataset to DB:", error);
    throw error;
  } finally {
    client.release();
  }
}

class TRMController {
  async getTRMData(req: Request, res: Response, next: NextFunction) {
    req.setTimeout(10 * 60 * 1000);
    try {
      const dataset = await buildDataset();

      if (!dataset.length)
        return res
          .status(404)
          .json({ message: "No data found for the last 24 hours." });

      res.json(dataset);
    } catch (error) {
      console.error("Error in getTRMData:", error);
      next(error);
    }
  }

  async getAllTRMData(req: Request, res: Response, next: NextFunction) {
    req.setTimeout(10 * 60 * 1000);
    try {
      const dataset = await buildDataset();

      if (!dataset.length)
        return res.status(404).json({ message: "No data found." });

      res.json(dataset);
    } catch (error) {
      console.error("Error in getTRMData:", error);
      next(error);
    }
  }

  async AllSortedTRMData(req: Request, res: Response, next: NextFunction) {
    // Implementation for fetching all sorted TRM data
    try {
      const dataset = await TrmFileModel.findAll();
      res.json(dataset);
    } catch (error) {
      console.error("Error in AllSortedTRMData:", error);
      next(error);
    }
  }
}

export default new TRMController();

// ───────────── Open SFTP Helper ─────────────
// Function to create directory if it doesn't exist
async function createDirIfNotExists(
  sftp: SFTPClient,
  path: string
): Promise<void> {
  try {
    await sftp.mkdir(path, true);
  } catch (err) {
    // Directory might already exist, ignore the error
  }
}

// Get month name from number (0-11)
function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month];
}

// Function to move processed file to Logs folder with year/month structure
async function moveToLogs(sftp: SFTPClient, filename: string): Promise<void> {
  try {
    const sourcePath = `${SFTP_REMOTE_DIR}/${filename}`;

    // Extract date from filename (format: TRM_YYYYMMDD_HHMM.xml)
    const match = filename.match(/TRM_(\d{4})(\d{2})/);
    if (!match) {
      throw new Error(`Invalid filename format: ${filename}`);
    }

    const year = match[1];
    const monthNum = parseInt(match[2]) - 1; // Convert to 0-based month
    const monthName = getMonthName(monthNum);

    // Create path structure
    const logsPath = `${SFTP_REMOTE_DIR}/Logs`;
    const yearPath = `${logsPath}/${year}`;
    const monthPath = `${yearPath}/${monthName}`;

    // Create directory structure if not exists
    await createDirIfNotExists(sftp, logsPath);
    await createDirIfNotExists(sftp, yearPath);
    await createDirIfNotExists(sftp, monthPath);

    // Move the file to the appropriate month folder
    const destinationPath = `${monthPath}/${filename}`;
    await sftp.rename(sourcePath, destinationPath);
    console.log(`Moved ${filename} to ${monthPath}`);
  } catch (err) {
    console.error(`Failed to move ${filename} to Logs folder:`, err);
    throw err;
  }
}

async function openSftp(): Promise<SFTPClient> {
  const sftp = new SFTPClient();
  const cfg: any = {
    host: "10.10.60.4",
    port: Number(SFTP_PORT),
    username: "ftpuser",
  };
  if (SFTP_KEY_PATH) {
    cfg.privateKey = fs.readFileSync(SFTP_KEY_PATH);
    if (SFTP_PASS) cfg.passphrase = SFTP_PASS;
  } else if (SFTP_PASS) {
    cfg.password = SFTP_PASS;
  }
  try {
    await sftp.connect(cfg);
    console.log("SFTP connection successful");
  } catch (err) {
    console.error("SFTP connection failed:", err);
    throw err;
  }
  return sftp;
}
