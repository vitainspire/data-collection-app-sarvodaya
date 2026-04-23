const URL = process.env.EXPO_PUBLIC_SHEETS_SCRIPT_URL;

async function testSync(type, payload) {
  console.log(`\nTesting Sync for: ${type}...`);
  try {
    const response = await fetch(URL, {
      method: "POST",
      body: JSON.stringify({ 
        spreadsheetId: process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID,
        type, 
        payload 
      })
    });
    const result = await response.json();
    console.log("Result:", JSON.stringify(result, null, 2));
    return result.status === "success";
  } catch (error) {
    console.error("Error:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("Starting Google Sheets Bridge Tests...");
  if (!URL) {
    console.error("❌ ERROR: EXPO_PUBLIC_SHEETS_SCRIPT_URL not found in environment.");
    process.exit(1);
  }
  console.log("URL:", URL);

  const farmerTest = await testSync("farmer", {
    id: "KA-F005",
    name: "John Doe",
    photoUri: "https://drive.google.com/uc?export=view&id=1tt--L0q6gYeO13Xq6aDcsXOTqgDtCQTw",
    capturedAt: new Date().toISOString()
  });

  const visitTest = await testSync("visit", {
    id: "KA-BL-F001",
    state: "KA",
    district: "BL",
    fieldArea: "3.5",
    cropType: "Maize",
    overallHealth: {
      plantStand: "Good",
      pestPressure: "None",
      diseaseSeen: "No",
      rainfallPattern: "Adequate"
    },
    createdAt: new Date().toISOString()
  });

  const sampleTest = await testSync("sample", {
    sampleId: "S-BL-20260423-05",
    fieldId: "KA-BL-F001",
    pH: "6.5",
    sensory: {
      smell: "Sweet",
      moisture: "Ideal",
      mold: "None",
      temperature: "Ambient"
    },
    grade: "A+",
    gps: { latitude: 12.9716, longitude: 77.5946 },
    createdAt: new Date().toISOString()
  });

  if (farmerTest && visitTest && sampleTest) {
    console.log("\n✅ ALL TESTS PASSED! Check your Google Sheet.");
  } else {
    console.log("\n❌ SOME TESTS FAILED. Check the errors above.");
  }
}

runTests();
