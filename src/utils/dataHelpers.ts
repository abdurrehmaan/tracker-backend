// src/utils/dataHelpers.ts

// Example function to pick specific fields from a record
export function pickFields(record: any): any {
  // Return the complete record with all fields from TRM XML
  return {
    Total_Records: record.Total_Records,
    Record_Sequence: record.Record_Sequence,
    VIR_Number: record.VIR_Number,
    BL_Number: record.BL_Number,
    GD_Number: record.GD_Number,
    Declaration_Type: record.Declaration_Type,
    Trader_NTN: record.Trader_NTN,
    Trader_Name: record.Trader_Name,
    Agent_Chal_No: record.Agent_Chal_No,
    Agent_Name: record.Agent_Name,
    Container_Number: record.Container_Number,
    Bonded_Carrier_NTN: record.Bonded_Carrier_NTN,
    Bonded_Carrier_Name: record.Bonded_Carrier_Name,
    Vehicle_Number: record.Vehicle_Number,
    Driver_Name: record.Driver_Name,
    Driver_Contact_Number: record.Driver_Contact_Number,
    Port_of_Origin: record.Port_of_Origin,
    Port_Of_Origin_Name: record.Port_Of_Origin_Name,
    Port_of_Destination: record.Port_of_Destination,
    Port_of_Destination_Name: record.Port_of_Destination_Name,
    Check_Post: record.Check_Post,
    Cargo_Type: record.Cargo_Type,
    Performed: record.Performed,
    Operation_Type: record.Operation_Type
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
