# Vitainspire: Farm Data Capture - Complete Run Guide

Vitainspire is an offline-first mobile application designed for agricultural data collection, focusing on harvest management, field health visits, and silage quality assessment.

---

## 🏗️ Technical Stack
- **Mobile**: React Native / Expo (TypeScript)
- **Styling**: NativeWind (Tailwind for React Native)
- **Storage**: AsyncStorage (Offline-first)
- **Backend**: Node.js (Express 5) + Drizzle ORM
- **Cloud Sync**: Google Apps Script (Drive for Photos, Sheets for Data)

---

## 🛠️ Prerequisites
1. **Node.js & pnpm**: Install via `npm install -g pnpm`.
2. **Expo Go**: Download on your iOS/Android device to test the mobile app.
3. **Google Account**: Required for Google Drive and Sheets synchronization.

---

## ⚙️ Environment Setup

Create a `.env` file in `artifacts/vitainspire/` with the following variables:

```env
# Google Apps Script URLs
EXPO_PUBLIC_GOOGLE_SCRIPT_URL="YOUR_DRIVE_BRIDGE_URL"
EXPO_PUBLIC_SHEETS_SCRIPT_URL="YOUR_SHEETS_BRIDGE_URL"

# Target IDs for Drive and Sheets
EXPO_PUBLIC_GOOGLE_DRIVE_FOLDER_ID="YOUR_DRIVE_FOLDER_ID"
EXPO_PUBLIC_GOOGLE_SHEET_ID="YOUR_SPREADSHEET_ID"
```

---

## ☁️ Google Integration Setup

### 1. Photo Storage (Google Drive)
- **Script Source**: `artifacts/vitainspire/utils/google-apps-script.js`
- **Steps**:
  1. Create a folder in Google Drive (e.g., "Farmer-Photos").
  2. Paste the script into [script.google.com](https://script.google.com).
  3. Update `FOLDER_ID` in the script.
  4. Deploy as **Web App** (Execute as: Me, Access: **Anyone**).
  5. Save the URL to `.env`.

### 2. Data Synchronization (Google Sheets)
- **Script Source**: `artifacts/vitainspire/utils/google-sheets-script.js`
- **Steps**:
  1. Create a new Google Spreadsheet.
  2. Paste the script into a new project at [script.google.com](https://script.google.com).
  3. Update `SPREADSHEET_ID` in the script.
  4. Deploy as **Web App** (Execute as: Me, Access: **Anyone**).
  5. Save the URL to `.env`.

---

## 🚀 Running the Application

### 1. Install Dependencies
Run from the root directory (`d:\Farm-Data-Capture`):
```powershell
pnpm install
```

### 2. Start the API Server
The API server handles health checks and extended data services.
```powershell
$env:PORT=5000; pnpm --filter @workspace/api-server start
```

### 3. Start the Mobile App (Expo)
```powershell
pnpm --filter @workspace/vitainspire dev
```
- Scan the QR code with **Expo Go** to run on your phone.
- Press **'w'** in the terminal to run in the web browser.

---

## 📱 Application Modules

### 👨‍🌾 Harvest Home
- **Goal**: Register a farmer to start the visit.
- **Action**: Tap "Capture Farmer Photo".
- **Result**: Photo saved to Drive; ID and timestamp synced to **Crop Data** sheet.

### 📍 Field Visit
- **Goal**: Document crop health and acreage.
- **Workflow**: Field Acres -> Field Health -> Smart Photo Checklist.
- **Result**: All 3 photos (Overview, Leaf, Cob) saved to Drive; metadata synced to **Crop Data** sheet.

### 🧪 Silage Sampling
- **Goal**: Assess silage quality through sensory and pH tests.
- **Workflow**: 8-step flow including pH, smell, moisture, and 4 required photos.
- **Result**: Photos saved to Drive; grade and data synced to **Silage Data** sheet.

---

## 🧪 Testing & Verification

We have provided scripts to verify your cloud bridges without running the full app:

- **Test Drive**: `node scripts/test-gas-bridge.js`
- **Test Sheets**: `node scripts/test-sheets-bridge.js`

Check your Google Drive folder and Spreadsheet after running these or using the app to confirm data is appearing correctly.
