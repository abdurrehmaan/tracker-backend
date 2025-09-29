// src/utils/dataHelpers.ts

// Example function to pick specific fields from a record
export function pickFields(record: any): any {
  return {
    VIR_Number: record.VIR_Number,
    BL_Number: record.BL_Number,
    GD_Number: record.GD_Number,
    Trader_Name: record.Trader_Name,
    // Add more fields as needed
  };
}

// Example function to extract records from parsed XML data
export function extractRecords(parsedData: any): any[] {
  // Adjust the extraction logic based on your XML structure
  if (!parsedData || !parsedData.records) {
    return [];
  }

  return parsedData.records.map((record: any) => {
    return {
      VIR_Number: record.VIR_Number,
      BL_Number: record.BL_Number,
      GD_Number: record.GD_Number,
      Trader_Name: record.Trader_Name,
      // Add other fields you need
    };
  });
}
