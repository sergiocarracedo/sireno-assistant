# Sireno Assistant - Beta Testing Instructions

Hey! 👋

Thanks for helping test Sireno Assistant! This is a beta version with new features, and your feedback will help make it better before the public release.

---

## 📦 What You're Getting

**Version:** 0.2.0 (Beta)  
**File:** `sireno-assistant-v0.2.0.zip` (attached to this email)

---

## 🚀 Quick Install (2 minutes)

### Step 1: Unzip the File

- Download the attached `sireno-assistant-v0.2.0.zip`
- Unzip it to a folder on your computer (e.g., `sireno-assistant/`)
- **Keep this folder** - Chrome will need it every time you use the extension

### Step 2: Enable Developer Mode in Chrome

1. Open Chrome
2. Go to: `chrome://extensions/` (paste in address bar)
3. Look for the toggle in the top right: **"Developer mode"**
4. Turn it **ON** 🔛

### Step 3: Load the Extension

1. Click the **"Load unpacked"** button (top left)
2. Select the folder where you unzipped the files
3. Click **"Select Folder"**

### Step 4: Success! 🎉

- You should see "Sireno Assistant" appear in your extensions list
- The Sireno icon should appear in your Chrome toolbar (top right)
- If you don't see it, click the puzzle piece icon 🧩 and pin Sireno

---

## 🎯 What to Test

### New Features in This Version

1. **Drag-and-Drop Chat** 💨
   - Click and drag the chat window header to move it anywhere
   - Try it on different websites
   - Does it stay where you put it?

2. **Sticky Mode** 📌
   - Open the inline chat on any form field
   - Click the pin icon to enable sticky mode
   - Try clicking outside - the chat should stay open
   - Click the pin again to disable

3. **Selection Editing** ✂️
   - Select some text in any input field
   - Open the inline chat (click the Sireno button or use Ctrl+Shift+F)
   - You should see "Editing selection: [your text]"
   - Send a command like "make this more professional"
   - Only the selected text should change

4. **Cancel Button** ❌
   - Start a long AI request
   - Click the cancel button (or press Escape)
   - The request should stop

5. **Extension Reload Warning** ⚠️
   - If you see an orange toast saying "Sireno Assistant needs to reload"
   - Click it to reload the page
   - This happens when the extension updates

6. **Rich Text Support** 📝
   - Try it on rich text editors (like Gmail, Notion, etc.)
   - Formatting should be preserved

---

## 🐛 Bug Reporting

### Found a bug? Please tell me!

**What I need:**

1. **What you were doing** when it happened
2. **What you expected** to happen
3. **What actually happened**
4. **Website URL** (if it happened on a specific site)
5. **Screenshots** (very helpful!)

**How to report:**

- Reply to this email
- Or message me directly

**Example bug report:**

```
When: I tried to drag the chat window on Gmail
Expected: The chat should move smoothly
Actual: It jumped to a weird position and I couldn't move it back
Website: gmail.com (composing an email)
Screenshot: [attached]
```

---

## 💡 General Feedback

I'd also love to hear:

- What do you like? ❤️
- What confuses you? 🤔
- What features are missing? 💭
- Would you use this regularly? 📊
- Any ideas for improvement? 💡

---

## 🔄 Updating to New Versions

When I send you a new version:

1. **Remove the old version:**
   - Go to `chrome://extensions/`
   - Find "Sireno Assistant"
   - Click the trash can icon 🗑️

2. **Install the new version:**
   - Follow the install steps above with the new zip file

3. **Your settings are saved** - API keys and preferences will still be there

---

## 🔧 Troubleshooting

### "Load unpacked" button is grayed out

- Make sure Developer mode is ON (toggle in top right)

### Extension doesn't appear after loading

- Check you selected the right folder (should contain `manifest.json`)
- Try refreshing the `chrome://extensions/` page

### Sireno button not showing on websites

- Make sure the extension is enabled
- Try refreshing the webpage
- Some sites block extensions (like Chrome Web Store itself)

### "Extension context invalidated" error

- This happens when the extension updates
- Reload the webpage (F5)
- Or click the orange notification if it appears

### AI not responding

- Go to Sireno settings (click extension icon → Settings)
- Check that your API key is entered correctly
- Make sure you have credits/balance with your AI provider

### Can't drag the chat window

- Make sure you're clicking on the **header** (top bar with "Sireno" title)
- Not the middle of the chat window
- Try refreshing the page

---

## 📱 Supported Websites

Should work on most websites with input fields:

- ✅ Gmail, Outlook, Yahoo Mail
- ✅ Twitter/X, Facebook, LinkedIn
- ✅ Google Docs, Notion, Confluence
- ✅ Any form or input field on the web

Won't work on:

- ❌ Chrome Web Store (Google blocks extensions here)
- ❌ Some banking/payment sites (for security)
- ❌ Sites with strict CSP policies

---

## 🔐 Privacy Note

- **Your API keys are stored locally** in your browser
- **No data is sent to Sireno servers**
- **All AI processing goes directly to your chosen provider** (OpenAI, Anthropic, etc.)
- You control your own data and costs

---

## 📞 Questions?

Reply to this email or reach out anytime!

**Thanks so much for testing!** Your feedback makes Sireno better for everyone. 🙏

---

**Quick Links:**

- Chrome Extensions page: `chrome://extensions/`
- Sireno Settings: Click the extension icon → "Settings"
- Keyboard shortcut: `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac)

Happy testing! 🚀
