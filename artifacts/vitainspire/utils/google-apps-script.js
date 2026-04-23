/**
 * Google Apps Script (GAS) Bridge Code
 * 
 * 1. Go to https://script.google.com
 * 2. Create a NEW PROJECT
 * 3. Paste the code below
 * 4. Create a folder in Google Drive named "Farming-App-Photos" and get its ID
 * 5. Update the FOLDER_ID variable below (CURRENTLY SET: 1V41MoM4Fj1trrOhu5lXKRaH_los8oCrv)
 * 6. DEPLOY as a WEB APP (Execute as: ME, Who has access: ANYONE)
 * 7. COPY the Web App URL and paste it into your .env file
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var folderId = data.folderId;
    var base64Data = data.base64;
    var fileName = data.fileName;
    var mimeType = data.mimeType || "image/jpeg";
    
    // Decode base64
    var bytes = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(bytes, mimeType, fileName);
    
    // Save to Folder
    var folder = DriveApp.getFolderById(folderId);
    var file = folder.createFile(blob);
    
    // Make file readable by URL
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      url: file.getUrl().replace("file/d/", "uc?export=view&id=").replace("/view?usp=drivesdk", ""),
      fileId: file.getId()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("✅ Google Drive Bridge is ONLINE. Ready for POST requests.").setMimeType(ContentService.MimeType.TEXT);
}
