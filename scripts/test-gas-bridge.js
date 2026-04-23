const URL = process.env.EXPO_PUBLIC_GOOGLE_SCRIPT_URL;

// 1x1 transparent PNG pixel in base64
const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

async function testBridge() {
  console.log("Testing Google Apps Script Bridge...");
  if (!URL) {
    console.error("❌ ERROR: EXPO_PUBLIC_GOOGLE_SCRIPT_URL not found in environment.");
    process.exit(1);
  }
  console.log("URL:", URL);

  try {
    const response = await fetch(URL, {
      method: "POST",
      body: JSON.stringify({
        folderId: process.env.EXPO_PUBLIC_GOOGLE_DRIVE_FOLDER_ID,
        base64: dummyBase64,
        fileName: "KA_BL_field_overview.png",
        mimeType: "image/png"
      })
    });

    const result = await response.json();
    console.log("Result:", JSON.stringify(result, null, 2));

    if (result.status === "success") {
      console.log("\n✅ SUCCESS! The bridge is working.");
      console.log("File URL:", result.url);
    } else {
      console.log("\n❌ FAILED. Error from bridge:", result.message);
    }
  } catch (error) {
    console.error("\n❌ FAILED. Network or parsing error:", error.message);
  }
}

testBridge();
