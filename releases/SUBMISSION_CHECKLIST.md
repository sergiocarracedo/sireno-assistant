# Chrome Web Store Submission Checklist

Use this checklist when submitting Sireno Assistant to the Chrome Web Store.

## 📋 Pre-Submission Checklist

### Build & Testing

- [ ] Updated version number in `package.json` and `manifest.json`
- [ ] Ran production build: `pnpm run build:release`
- [ ] Tested extension in Chrome locally (load unpacked from `dist/`)
- [ ] Verified all features work correctly
- [ ] Checked console for errors
- [ ] Tested on multiple websites
- [ ] Verified API key storage and retrieval
- [ ] Tested all AI providers (OpenAI, Anthropic, Google, Groq)

### Assets Ready

- [ ] Extension icon (128x128) in `public/icons/icon128.png`
- [ ] Screenshots (1280x800 or 640x400) in `public/screenshots/`
- [ ] Promotional images ready (if needed)
- [ ] Privacy policy URL ready (if applicable)

### Store Listing Information

- [ ] Short description (132 characters max)
- [ ] Detailed description (prepared)
- [ ] Category selected: **Productivity**
- [ ] Language: **English** (and others if localized)

## 📝 Store Listing Content

### Short Description

```
Your AI-powered assistant for web forms. Use your own API keys (OpenAI, Anthropic, Google, Groq) for privacy-first AI assistance.
```

### Detailed Description

```
Sireno Assistant is your privacy-first AI companion for web browsing. Transform how you interact with web forms, emails, and content using the power of AI - with complete control over your data.

✨ KEY FEATURES

🔐 Privacy First
• Use your own API keys (OpenAI, Anthropic, Google, Groq)
• All keys stored locally in your browser
• No data sent to Sireno servers
• You control your data and costs

🤖 Smart Field Assistance
• AI-powered inline chat for any input field
• Context-aware suggestions
• Multi-language support
• Works on any website

✂️ Selection Editing
• Transform just the selected text
• Preserve surrounding content
• Works with rich text editors

🎯 Advanced Features
• Drag-and-drop chat positioning
• Sticky mode to prevent accidental closing
• Custom skills for specialized tasks
• Dark mode support
• Field exclusion for sensitive inputs

📊 Field Management
• Discover all fields on a page
• Bulk operations
• Exclude sensitive fields
• Per-field settings

🎨 Modern UI
• Clean, intuitive interface
• Smooth animations
• Responsive design
• Keyboard shortcuts (Ctrl+Shift+F / Cmd+Shift+F)

💡 USE CASES

• Fill out forms faster with AI assistance
• Improve email writing and tone
• Translate content on the fly
• Generate creative content
• Format and structure text
• Extract information from pages
• And much more!

🚀 GET STARTED

1. Install the extension
2. Click the Sireno icon or press Ctrl+Shift+F
3. Go to Settings and add your AI provider API key
4. Start using AI assistance on any website!

📖 SUPPORT & DOCUMENTATION

Visit our documentation for detailed guides, examples, and troubleshooting.

🔓 OPEN SOURCE

Sireno Assistant is open source (GPL-3.0 license). Contribute on GitHub!

⚡ PRIVACY & SECURITY

• No analytics or tracking
• No data collection
• API keys encrypted in local storage
• Open source code for transparency
• Regular security updates
```

### Screenshots Needed

1. Inline chat in action on a form
2. Side panel overview
3. Settings page with API configuration
4. Field discovery and management
5. Custom skills editor

## 🚀 Submission Steps

### 1. Upload Package

- [ ] Login to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [ ] Select extension or click "New Item"
- [ ] Upload `sireno-assistant-v0.2.0.zip`
- [ ] Wait for validation (should pass without errors)

### 2. Store Listing Tab

- [ ] Upload icon (128x128)
- [ ] Upload screenshots (minimum 1, recommended 3-5)
- [ ] Fill in short description
- [ ] Fill in detailed description
- [ ] Select category: Productivity
- [ ] Add support email: hi@sergiocarracedo.es
- [ ] Add website: https://sireno-assistant.dev (if available)

### 3. Privacy Tab

- [ ] Select: "Does NOT use remote code"
- [ ] Declare permissions usage:
  - **activeTab**: "To detect and interact with input fields on the current page"
  - **storage**: "To save user settings, API keys, and preferences locally"
  - **scripting**: "To inject content scripts for field detection and AI assistance"
  - **sidePanel**: "To display the assistant panel"
  - **Host permissions**: "To communicate with AI provider APIs (OpenAI, Anthropic, Google, Groq) using user's own API keys"
- [ ] Single purpose description: "AI-powered assistant for web form filling and content enhancement"
- [ ] Complete privacy practices questionnaire
- [ ] Indicate: "This extension does NOT collect user data"

### 4. Distribution Tab

- [ ] Select visibility:
  - **Public**: Available to everyone
  - **Unlisted**: Only via direct link
  - **Private**: Testing/Beta group only
- [ ] For beta: Add tester emails or Google Group
- [ ] Select regions (or "All regions")
- [ ] Pricing: Free

### 5. Review & Submit

- [ ] Review all tabs for completeness
- [ ] Preview the store listing
- [ ] Click "Submit for review"
- [ ] Save the submission confirmation

## ⏱️ After Submission

- [ ] Note submission date and time
- [ ] Wait for review (typically 1-3 business days)
- [ ] Check email for review status
- [ ] Respond to any review feedback promptly
- [ ] Once approved, verify listing is live
- [ ] Test installation from Chrome Web Store
- [ ] Announce release to users

## 🔄 Updates

For future updates:

1. Increment version in `package.json` and `manifest.json`
2. Run `pnpm run build:release`
3. Upload new zip to existing extension listing
4. Update "What's new" section with changes
5. Submit for review

## 📞 Common Review Issues

Be prepared to address:

- **Permission justification**: Explain why each permission is needed
- **Remote code**: Confirm no remote code is loaded
- **Privacy policy**: May be required if collecting any data
- **Keyword stuffing**: Avoid repetitive keywords in description
- **Misleading claims**: Ensure all features are accurate

## 🎯 Version 0.2.0 Highlights

**What's New:**

- Enhanced inline chat with drag-and-drop positioning
- Sticky mode to prevent accidental closing
- Selection-only editing mode
- Improved button visibility and UX
- Better error handling and extension reload detection
- Rich text (HTML) support for contenteditable fields
- Cancel operation support
- Minimum field width filtering

---

**Last Updated:** 2026-03-04  
**Package:** sireno-assistant-v0.2.0.zip  
**Size:** ~1.4 MB
