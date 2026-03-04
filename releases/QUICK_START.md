# Quick Start: Uploading to Chrome Web Store

## 📦 What You Have

**File:** `sireno-assistant-v0.2.0.zip` (~1.4 MB)  
**Version:** 0.2.0  
**Ready for:** Production or Beta release

## ⚡ Quick Upload Steps

### 1. Go to Chrome Web Store Developer Dashboard

👉 https://chrome.google.com/webstore/devconsole

### 2. Login & Select Extension

- Login with your Google account
- Click on your extension (or "New Item" for first release)

### 3. Upload Package

- Click **"Upload new package"** or **"Upload updated package"**
- Select: `sireno-assistant-v0.2.0.zip`
- Wait for upload validation ✅

### 4. For Beta/Testing Release

If you want to publish as beta instead of production:

- Before submitting, select **"Testing"** tab
- Choose **"Trusted testers"**
- Add tester email addresses
- Save changes

### 5. Submit for Review

- Click **"Submit for review"**
- Review typically takes 1-3 business days
- You'll receive an email when status changes

## 📸 Required Assets

Screenshots are already included in the zip, but you may want to:

- Prepare promotional tile (440x280 pixels)
- Prepare marquee (1400x560 pixels)

## 🔑 Key Information to Have Ready

- **Support email:** hi@sergiocarracedo.es
- **Category:** Productivity
- **Single purpose:** AI-powered assistant for web form filling and content enhancement
- **Privacy:** Does NOT collect user data (users provide their own API keys)

## 📋 Short Description (132 chars)

```
Your AI-powered assistant for web forms. Use your own API keys (OpenAI, Anthropic, Google, Groq) for privacy-first AI assistance.
```

## 🔐 Permission Justifications

Be ready to explain these permissions:

| Permission       | Justification                                                   |
| ---------------- | --------------------------------------------------------------- |
| `activeTab`      | To detect and interact with input fields on the current page    |
| `storage`        | To save user settings, API keys, and preferences locally        |
| `scripting`      | To inject content scripts for field detection and AI assistance |
| `sidePanel`      | To display the assistant panel                                  |
| Host permissions | To communicate with AI provider APIs using user's own API keys  |

## ⏱️ Timeline

1. **Upload:** Instant
2. **Validation:** 1-2 minutes
3. **Review:** 1-3 business days
4. **Published:** Within hours of approval

## 📞 Need Help?

- Full checklist: See `SUBMISSION_CHECKLIST.md`
- Chrome Web Store docs: https://developer.chrome.com/docs/webstore/
- Contact: hi@sergiocarracedo.es

---

**Good luck with your submission! 🚀**
