# Sireno Assistant - Chrome Web Store Releases

This directory contains production-ready builds for uploading to the Chrome Web Store.

## 📦 Current Release

**Version:** 0.2.0  
**File:** `sireno-assistant-v0.2.0.zip`  
**Size:** ~1.4 MB

## 🚀 How to Upload to Chrome Web Store

### Prerequisites

1. You need access to the Chrome Web Store Developer Dashboard
2. Go to: https://chrome.google.com/webstore/devconsole

### Upload Steps

1. **Login** to the Chrome Web Store Developer Dashboard
2. **Select** your extension (or click "New Item" if this is the first release)
3. **Upload** the zip file:
   - Click "Upload new package"
   - Select `sireno-assistant-v0.2.0.zip`
   - Wait for the upload and validation to complete
4. **Fill in Store Listing** (if first time):
   - Detailed description
   - Screenshots (available in `packages/extension/public/screenshots/`)
   - Icon (128x128, available in `packages/extension/public/icons/`)
   - Category: Productivity
   - Privacy practices
5. **Submit for Review**:
   - Review all information
   - Click "Submit for review"
   - Wait for Google's review (typically 1-3 days)

### Publishing as Beta/Testing Track

To publish as beta instead of production:

1. In the Developer Dashboard, go to your extension
2. Click on "Package" tab
3. Upload the new version
4. Before submitting, select **"Testing track"** or **"Beta channel"**
5. Provide a group of testers (email addresses or Google Group)
6. Submit for review

## 🔧 Building New Releases

To create a new release package:

```bash
cd packages/extension
pnpm run build:release
```

This will:

1. Clean previous builds
2. Run TypeScript compilation
3. Build with Vite in production mode
4. Create a zip file in `releases/` directory

## 📝 Version History

- **v0.2.0** (2026-03-04)
  - Enhanced inline chat with drag-and-drop
  - Added sticky mode toggle
  - Selection-only editing mode
  - Improved UX and bug fixes

## ⚠️ Important Notes

- **Do not commit** zip files to git (they are gitignored)
- **Keep this README** for documentation
- **Test thoroughly** before uploading to production
- **Update manifest.json version** before building new releases
- Chrome Web Store has a **max file size of 100 MB**
- Packages are scanned for malware and policy violations

## 🔐 Privacy & Permissions

This extension requires:

- `activeTab`: To interact with the current page
- `storage`: To save user settings and API keys
- `scripting`: To inject content scripts
- `sidePanel`: To show the assistant panel
- Host permissions for AI API endpoints (OpenAI, Anthropic, Google, Groq)

All API keys are stored locally in the user's browser. No data is sent to Sireno servers.

## 📞 Support

If you encounter issues during the upload process:

- Check Chrome Web Store [developer documentation](https://developer.chrome.com/docs/webstore/)
- Review [extension policies](https://developer.chrome.com/docs/webstore/program-policies/)
- Contact: hi@sergiocarracedo.es
