import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

const GOOGLE_SCRIPT_URL = process.env.EXPO_PUBLIC_GOOGLE_SCRIPT_URL;
const FOLDER_ID = process.env.EXPO_PUBLIC_GOOGLE_DRIVE_FOLDER_ID;

interface UploadResponse {
  status: "success" | "error";
  url?: string;
  fileId?: string;
  message?: string;
}

/**
 * Uploads an image to Google Drive via the GAS Bridge
 * @param uri Local file URI from ImagePicker
 * @param fileName Desired filename in Google Drive
 * @returns The Drive URL and file ID
 */
export async function uploadToDrive(uri: string, fileName: string): Promise<string | null> {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn("EXPO_PUBLIC_GOOGLE_SCRIPT_URL is not defined in environment variables.");
    if (Platform.OS !== "web") {
      require("react-native").Alert.alert("Config Error", "Drive URL is missing.");
    }
    return null;
  }

  try {
    // Read file as base64
    let base64: string | undefined;

    if (Platform.OS === "web") {
      // On Web, we fetch the blob and convert using FileReader
      const blobRes = await fetch(uri);
      const blob = await blobRes.blob();
      base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res.split(",")[1]); // Remove data:image/jpeg;base64,
        };
        reader.readAsDataURL(blob);
      });
    } else {
      base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    if (!base64) throw new Error("Failed to convert image to base64");

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        folderId: FOLDER_ID,
        base64,
        fileName,
        mimeType: "image/jpeg",
      }),
    });

    const result: UploadResponse = await response.json();

    if (result.status === "success") {
      console.log("Image uploaded to Drive:", result.url);
      return result.url || null;
    } else {
      console.error("GAS Bridge Error:", result.message);
      return null;
    }
  } catch (error) {
    console.error("Failed to upload image to Drive:", error);
    return null;
  }
}
