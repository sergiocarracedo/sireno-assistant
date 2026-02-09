# Chrome Web Store - Unlisted Publication Steps

## Step 1: Create Developer Account

1. Go to: https://chrome.google.com/webstore/devconsole
2. Sign in with your Google account
3. Click "Pay Registration Fee" (one-time $5 fee)
4. Fill in developer information
5. Wait for account verification (usually instant, sometimes a few hours)

## Step 2: Prepare Your Listing Content

### Short Description (132 chars max)
```
AI-powered assistant for web forms. Use your own OpenAI, Anthropic, or Google AI key to fill and enhance any website content.
```

### Detailed Description
```markdown
# Sireno Assistant - Your AI-Powered Form Assistant

Sireno Assistant brings AI directly to your web forms. Click the sparkle icon next to any input field and let AI help you write, fill, or enhance content with natural language commands.

## ✨ Key Features

• **Universal Compatibility**: Works on any website with input fields
• **Your Own API Keys**: Use OpenAI (GPT-4), Anthropic (Claude), or Google AI (Gemini)
• **Smart Context**: AI understands the page context for better suggestions
• **Privacy First**: Your data stays between you and your chosen AI provider
• **Custom Skills**: Create AI behaviors for specific websites
• **Multi-language**: Supports English and Spanish

## 🚀 How It Works

1. Visit any website with forms (Gmail, Twitter, LinkedIn, etc.)
2. Look for the purple sparkle icon next to input fields
3. Click it and describe what you want in natural language
4. Review AI suggestions and apply with one click

## 🔐 Privacy & Security

• No data sent to our servers
• API keys stored locally in your browser
• Direct communication with your chosen AI provider
• Open source code available for review
• No tracking or analytics

## 📋 Requirements

You'll need an API key from one of:
• OpenAI: https://platform.openai.com/api-keys
• Anthropic: https://console.anthropic.com/settings/keys
• Google AI: https://aistudio.google.com/app/apikey

All providers offer free trials or credits for new users.

## 🎯 Perfect For

• Writing email replies
• Creating social media posts
• Filling out forms and applications
• Generating professional content
• Translating or rephrasing text
• Getting quick AI assistance anywhere on the web

## 🛠️ Advanced Features

• **Context Levels**: Control how much page context AI receives
• **Skills System**: Create custom AI behaviors per website
• **Field Exclusion**: Keep sensitive fields private
• **Inline Chat**: Natural conversation with AI about your content
• **Multi-field Support**: Fill multiple fields at once

## 📖 Support

• GitHub: https://github.com/sergiocarracedo/sireno-assistant
• Issues: Report bugs or request features on GitHub
• Email: [your-email@example.com]

---

Open Source | Privacy Focused | Bring Your Own Key
```

### Category
Choose: **Productivity**

### Language
**English** (primary)

## Step 3: Create Privacy Policy

You MUST have a privacy policy. Here's a template:

### Option A: Host on GitHub (Free & Easy)

Create a file `PRIVACY.md` in your repo:

```markdown
# Privacy Policy for Sireno Assistant

Last Updated: February 9, 2026

## Overview
Sireno Assistant is a browser extension that helps users interact with web forms using AI. We take your privacy seriously.

## Data Collection
Sireno Assistant does NOT collect, store, or transmit any personal data to our servers.

## How Your Data is Handled

### API Keys
- Stored locally in your browser using Chrome's storage API
- Never transmitted to our servers
- Only sent to your chosen AI provider (OpenAI, Anthropic, or Google AI)

### Form Content
- Content from web forms is sent ONLY to your chosen AI provider's API
- We do not have access to this data
- No data is stored on our servers
- Data handling follows your AI provider's privacy policy

### Browsing Data
- The extension detects form fields on websites you visit
- This information stays in your browser
- No browsing history is collected or transmitted

## Third-Party Services

When you use Sireno Assistant, data is sent to your chosen AI provider:
- OpenAI: https://openai.com/privacy
- Anthropic: https://www.anthropic.com/privacy
- Google AI: https://policies.google.com/privacy

Each provider has their own privacy policy governing how they handle your data.

## Permissions Explanation

The extension requires these permissions:
- **storage**: Store your settings and API keys locally
- **activeTab**: Detect form fields on the current tab
- **scripting**: Inject UI elements (assistant buttons) into web pages
- **sidePanel**: Display the assistant interface

## Your Control

You have full control over:
- Which AI provider to use
- What data to send (through context level settings)
- Which fields to exclude from AI
- When to use the extension (enable/disable anytime)

## Data Retention
Since we don't collect data, there's nothing to retain. All data stays in your browser until you uninstall the extension.

## Children's Privacy
Sireno Assistant is not intended for children under 13. We do not knowingly collect data from children.

## Changes to Privacy Policy
We may update this policy. Check the "Last Updated" date above. Continued use after changes constitutes acceptance.

## Contact
Questions about privacy? Contact us:
- Email: [your-email@example.com]
- GitHub: https://github.com/sergiocarracedo/sireno-assistant

## Open Source
Our code is open source and available for review at:
https://github.com/sergiocarracedo/sireno-assistant
```

Then access it via: `https://github.com/sergiocarracedo/sireno-assistant/blob/main/PRIVACY.md`

### Option B: Host on your own website
Upload the privacy policy to your website and use that URL.

## Step 4: Upload Extension

1. Go to Chrome Web Store Developer Dashboard
2. Click **"New Item"**
3. Upload `sireno-assistant-test.zip`
4. Wait for upload to complete

## Step 5: Fill Store Listing

### Store Listing Tab

**Product Details:**
- Extension Name: `Sireno Assistant`
- Summary: (132 chars) Copy short description from above
- Detailed Description: Copy detailed description from above
- Category: `Productivity`
- Language: `English`

**Graphic Assets:**
- Icon: ✅ Auto-detected from manifest
- Screenshots: Upload your 4 screenshots from `public/screenshots/`
  - Tip: Chrome prefers 1280x800 but will accept your sizes
  - Add captions to each screenshot explaining what it shows

**Additional Fields:**
- Official URL: `https://github.com/sergiocarracedo/sireno-assistant` (or your website)
- Support URL/Email: Your email or GitHub issues page

### Privacy Tab

**Privacy Policy:**
- Add your Privacy Policy URL (from GitHub or your site)

**Data Usage Disclosure:**
- Does this extension collect user data? **No** (you don't collect, only pass through to AI)
- Or if you want to be thorough: **Yes**, then explain it's only sent to AI providers

**Permissions Justification:**
Explain each permission (Chrome will ask):
```
- storage: Store user settings and API keys locally in browser
- activeTab: Detect and interact with form fields on current page
- scripting: Inject assistant UI elements into web pages
- sidePanel: Display the assistant control panel
```

### Distribution Tab

**Visibility:**
🔒 **IMPORTANT - Select: "Unlisted"**

This means:
- ✅ Only people with the direct link can install
- ✅ Won't appear in Chrome Web Store search
- ✅ Won't show on your developer profile
- ✅ Perfect for testing with specific people

**Countries:**
- Select "All regions" or specific countries

**Pricing:**
- Select: **Free**

## Step 6: Submit for Review

1. Review all tabs (Product Details, Privacy, Distribution)
2. Click **"Submit for Review"**
3. Wait for review (typically 1-3 business days)

## Step 7: Get Your Unlisted Link

Once approved, you'll get a link like:
```
https://chrome.google.com/webstore/detail/[extension-id]
```

Share this link ONLY with your testers. They can install it like a normal extension, but others won't find it by searching.

## 🎯 Advantages of Unlisted

✅ Professional installation (no Developer Mode)
✅ Automatic updates for testers
✅ Real Chrome Web Store experience
✅ Still private/controlled access
✅ Can make it public later with one click

## 🚀 After Approval

When you're ready to go public:
1. Go to Developer Dashboard
2. Select your extension
3. Distribution tab → Change to "Public"
4. Submit update

## 📊 Monitoring

Even as unlisted, you can see:
- Number of installations
- Active users
- Crash reports
- Reviews (only from people with the link)

---

**Total Time Estimate:**
- Account setup: 10 minutes
- Preparing assets: 30-60 minutes  
- Uploading & filling forms: 20-30 minutes
- Review wait time: 1-3 days
- **Total: ~1 hour of work + waiting for review**
