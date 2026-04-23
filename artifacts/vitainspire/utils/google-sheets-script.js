/**
 * Google Sheets Bridge Code for Vitainspire
 * 
 * 1. Go to https://script.google.com
 * 2. Create a NEW PROJECT named "Vitainspire-Sheets-Bridge"
 * 3. Paste the code below
 * 4. Create a NEW Google Sheet and get its ID from the URL
 * 5. Update the SPREADSHEET_ID variable below
 * 6. DEPLOY as a WEB APP (Execute as: ME, Who has access: ANYONE)
 * 7. COPY the Web App URL and add it to your .env file as EXPO_PUBLIC_SHEETS_SCRIPT_URL
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const spreadsheetId = data.spreadsheetId;
    const type = data.type; // 'farmer', 'visit', or 'sample'
    const payload = data.payload;
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    let sheetName = "";
    let headers = [];
    let row = [];

    if (type === "farmer" || type === "visit") {
      sheetName = "Crop Data";
      headers = ["Type", "ID", "Name", "State/Photo", "District/At", "Area/Extra", "Crop", "Plant Stand", "Pest Pressure", "Disease", "Rainfall", "Created At"];
      if (type === "farmer") {
        row = ["Farmer", payload.id, payload.name || "N/A", payload.photoUri, payload.capturedAt, "", "", "", "", "", "", payload.capturedAt];
      } else {
        row = [
          "Field Visit",
          payload.id, 
          payload.state, 
          payload.district, 
          payload.fieldArea, 
          payload.cropType,
          payload.overallHealth.plantStand,
          payload.overallHealth.pestPressure,
          payload.overallHealth.diseaseSeen,
          payload.overallHealth.rainfallPattern,
          payload.createdAt
        ];
      }
    } else if (type === "sample") {
      sheetName = "Silage Data";
      headers = ["Sample ID", "Field ID", "pH", "Smell", "Moisture", "Mold", "Temperature", "Grade", "Lat", "Long", "Created At"];
      row = [
        payload.sampleId,
        payload.fieldId,
        payload.pH,
        payload.sensory.smell,
        payload.sensory.moisture,
        payload.sensory.mold,
        payload.sensory.temperature,
        payload.grade,
        payload.gps ? payload.gps.latitude : "",
        payload.gps ? payload.gps.longitude : "",
        payload.createdAt
      ];
    } else {
      throw new Error("Invalid data type: " + type);
    }

    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
    }

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data appended to " + sheetName
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("✅ Google Sheets Bridge is ONLINE. Ready for POST requests.").setMimeType(ContentService.MimeType.TEXT);
}
