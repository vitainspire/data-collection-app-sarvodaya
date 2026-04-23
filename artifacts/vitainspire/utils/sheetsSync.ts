const SHEETS_SCRIPT_URL = process.env.EXPO_PUBLIC_SHEETS_SCRIPT_URL;
const SPREADSHEET_ID = process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID;

type DataType = "farmer" | "visit" | "sample";

/**
 * Syncs data to Google Sheets via the GAS Bridge
 * @param type The type of data being synced
 * @param payload The data object
 */
export async function syncToSheets(type: DataType, payload: any): Promise<boolean> {
  if (!SHEETS_SCRIPT_URL) {
    console.warn("EXPO_PUBLIC_SHEETS_SCRIPT_URL is not defined.");
    if (require("react-native").Platform.OS !== "web") {
      require("react-native").Alert.alert("Config Error", "Sync URL is missing. Please restart the app.");
    }
    return false;
  }

  try {
    const response = await fetch(SHEETS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        spreadsheetId: SPREADSHEET_ID,
        type,
        payload,
      }),
    });

    const result = await response.json();

    if (result.status === "success") {
      console.log(`Successfully synced ${type} to Sheets.`);
      return true;
    } else {
      console.error(`Sheets Sync Error (${type}):`, result.message);
      if (Platform.OS !== "web") {
        require("react-native").Alert.alert("Sync Error", result.message);
      }
      return false;
    }
  } catch (error) {
    console.error(`Failed to sync ${type} to Sheets:`, error);
    if (Platform.OS !== "web") {
      require("react-native").Alert.alert("Sync Failed", error.message);
    }
    return false;
  }
}
