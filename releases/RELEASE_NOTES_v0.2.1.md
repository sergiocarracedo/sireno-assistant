# Sireno Assistant v0.2.1 - Release Notes

**Release Date:** March 4, 2026  
**Package:** `sireno-assistant-v0.2.1.zip` (636 KB)

## 🎉 What's New

### Side Panel Transfer Button

The biggest feature in this release is the new **"Open in side panel"** button in the inline chat interface!

#### How It Works

1. **Type your message** in the inline chat (when you click on any field)
2. **Click the PanelRight button** in the chat header to transfer to side panel
3. **Get visual feedback** - a notification slides in and a blue badge "1" appears on the extension icon
4. **Click the extension icon** to open the side panel
5. **Your message appears** pre-filled in the side panel chat input, ready to send!

#### Key Features

- ✅ **Visual Notifications**: Animated slide-in notification guides you to click the extension icon
- ✅ **Badge Indicator**: Blue "1" badge appears on extension icon when message is pending
- ✅ **Auto-Fill**: Message automatically appears in side panel input
- ✅ **Field Context Preserved**: If you were focused on a specific field, it stays selected
- ✅ **Security**: Messages expire after 5 seconds to prevent confusion
- ✅ **Smooth UX**: Auto-clears badge when message is retrieved

#### Why This Matters

This feature bridges the gap between the quick inline chat (for simple tasks) and the full side panel experience (for complex conversations). Now you can:

- Start a conversation in inline chat
- Realize you need more context or features
- Transfer to side panel with one click
- Continue the conversation without retyping

### Build System Improvements

- **Optimized Package Size**: Reduced from 5MB to 636KB by excluding screenshots and images
- **Better Build Script**: Updated `build-release.sh` to exclude unnecessary files
- **Clean Releases**: Only includes essential files for extension functionality

## 📦 Package Details

- **File:** `sireno-assistant-v0.2.1.zip`
- **Size:** 636 KB (compressed)
- **Contents:**
  - Extension code (JS, CSS, HTML)
  - Required icons (16x16, 48x48, 128x128)
  - Manifest v3 configuration
  - Service worker and content scripts

## 🔧 Technical Changes

### Files Modified

1. **`src/content/components/InlineChatApp.tsx`**
   - Added PanelRight button in chat header
   - Added click handler for side panel transfer

2. **`src/content/iframe-chat.ts`**
   - Implemented `handleOpenSidePanel()` function
   - Added animated notification system
   - Message storage with expiry logic

3. **`src/background/message-handler.ts`**
   - Added badge setting on message save
   - Enhanced `SEND_TO_SIDEBAR` handler

4. **`src/sidepanel/views/chat/ChatView.tsx`**
   - Added pending message check on mount
   - Badge clearing when message retrieved
   - 5-second expiry validation

5. **`scripts/build-release.sh`**
   - Excluded screenshots and images from package
   - Optimized zip file size

### New Dependencies

None! This release uses existing dependencies.

## 🐛 Bug Fixes

- Fixed user gesture issue when trying to programmatically open side panel
  - **Previous behavior**: Attempted to call `chrome.sidePanel.open()` from background script, which failed due to Chrome security model
  - **New behavior**: Uses notification + badge approach to guide user to click extension icon, which preserves user gesture context

## 🔐 Security

- **Message Expiry**: Messages only valid for 5 seconds to prevent old messages from appearing unexpectedly
- **User Gesture Compliance**: Respects Chrome's user gesture requirements for opening side panels
- **No New Permissions**: This release doesn't require any additional Chrome permissions

## 📝 Testing

A comprehensive testing guide is available in `TESTING_SIDEPANEL_BUTTON.md` with:

- 6 detailed test cases
- Expected behaviors
- Edge cases
- Troubleshooting tips

## 🚀 Installation

### For Testing (Developer Mode)

1. Download `sireno-assistant-v0.2.1.zip`
2. Extract to a folder
3. Go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked"
6. Select the extracted folder

### For Beta Testers

Send the zip file with `BETA_TESTING_INSTRUCTIONS.md` to your beta testers.

### For Chrome Web Store Submission

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Select your extension (or create new listing)
3. Upload `sireno-assistant-v0.2.1.zip`
4. Update listing details if needed
5. Submit for review

See `SUBMISSION_CHECKLIST.md` and `QUICK_START.md` for detailed guides.

## 🎯 Known Limitations

1. **Manual Icon Click**: Users must click the extension icon to open side panel (Chrome security requirement)
2. **Message Expiry**: Messages expire after 5 seconds (by design for security)
3. **Single Message**: Only one pending message at a time (new messages overwrite old ones)

## 📊 Version History

- **v0.2.1** (March 4, 2026): Side panel transfer button + build improvements
- **v0.2.0** (February 10, 2026): Groq provider support, multi-provider config
- **v0.1.0** (February 9, 2026): Initial public release

## 🙏 Feedback

We'd love to hear your thoughts on this new feature!

- **GitHub Issues**: https://github.com/sergiocarracedo/sireno-assistant/issues
- **Email**: hi@sergiocarracedo.es

## 📚 Documentation

- **Testing Guide**: `TESTING_SIDEPANEL_BUTTON.md`
- **Beta Testing**: `BETA_TESTING_INSTRUCTIONS.md`
- **Submission Guide**: `SUBMISSION_CHECKLIST.md`
- **Quick Start**: `QUICK_START.md`
- **Changelog**: `../CHANGELOG.md`

---

**Happy form-filling! 🎉**
