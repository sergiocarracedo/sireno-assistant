<div align="center">
  <img src="public/icons/logo.png" alt="Sireno Assistant Logo" width="128"/>
  
  # Sireno Assistant
  
  **Your AI-powered assistant for web forms and content**
  
  [![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18.2-blue)](https://react.dev/)
  
  [Installation](#-installation) • [Features](#-features) • [Quick Start](#-quick-start) • [Contributing](CONTRIBUTING.md)
</div>

---

## 🌟 What is Sireno Assistant?

Sireno Assistant is a Chrome extension that brings AI assistance directly to any web form or text field. Unlike other AI tools, Sireno is **privacy-first** and works with **your own API keys**.

### Why Sireno?

- ✅ **Your API Keys, Your Data**: Works with OpenAI, Anthropic (Claude), Google (Gemini), or Groq
- ✅ **Free Tier Option**: Get started with Groq's free tier - no credit card required
- ✅ **Complete Privacy**: No data sent to third parties, everything stays between you and your chosen AI provider
- ✅ **Works Everywhere**: Compatible with ANY website - Gmail, LinkedIn, Notion, Twitter, and more
- ✅ **Multilingual**: Available in English and Spanish (more languages coming soon)
- ✅ **Open Source**: Fully auditable code under GPL-3.0 license
- ✅ **Customizable**: Skills system lets you create custom AI behaviors for different websites

## ✨ Features

### 🎯 Inline AI Chat

Click the AI button on any input field to get instant assistance. Perfect for:

- Writing emails
- Composing social media posts
- Filling out forms
- Translating text
- Fixing grammar

### 📝 Multi-Field Form Filling

Select multiple fields and let AI fill them all intelligently based on your instructions.

### 🎨 Skills System

Create custom AI behaviors for different websites. For example:

- Professional tone for LinkedIn
- Casual tone for Twitter
- Formal language for business emails

### 🔍 Smart Context

5 levels of context awareness:

- **None**: Just your instruction
- **Domain**: Includes website domain
- **URL**: Includes full page URL
- **Selected**: Includes selected page text
- **All Page**: Includes visible page content

### 🌍 Multi-Language Support

- 🇬🇧 English
- 🇪🇸 Spanish
- Want your language? See [Contributing](CONTRIBUTING.md)

### 🛡️ Privacy & Transparency

- **Optional LLM Logging**: See exactly what data is sent to your AI provider
- **Local Storage Only**: Your API keys never leave your device
- **No Tracking**: Zero telemetry or analytics
- **Open Source**: Audit the code yourself

## 📦 Installation

### From Chrome Web Store

Install directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/ppnecnomfnadhbcpacgkfldiapoejogo)

### From Source

1. **Clone the repository**

   ```bash
   git clone https://github.com/sergiocarracedo/sireno-assistant
   cd sireno-assistant
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the extension**

   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist/` directory from this project

## 🚀 Quick Start

### 1. Configure Your API Key

1. Click the Sireno icon in your browser toolbar (or press `Ctrl+Shift+F` / `Cmd+Shift+F` on Mac)
2. Go to the **Settings** tab
3. Select your preferred AI provider:
   - **Groq** (Recommended for beginners - FREE tier available at [console.groq.com/keys](https://console.groq.com/keys))
   - **OpenAI** (GPT models)
   - **Anthropic** (Claude models)
   - **Google** (Gemini models)
4. Enter your API key
5. Adjust temperature and max tokens if desired
6. Click "Save Settings"

### 2. Use Inline Chat

1. Navigate to any webpage with text fields (e.g., Gmail, LinkedIn, Twitter)
2. Hover over or click into any input field
3. Click the ✨ AI button that appears
4. Type your instruction (e.g., "Write a professional email about...")
5. Press Enter or click Send
6. Review the AI's response
7. Click "Apply" to insert the text

### 3. Fill Multiple Fields

1. Click the Sireno icon to open the side panel
2. Go to the **Fields** tab
3. Click "Scan Fields" to detect all form fields on the page
4. Select the fields you want to fill
5. Go to the **Chat** tab
6. Enter instructions like "Fill this contact form with my details"
7. Select a context level
8. Click "Send" and review proposed changes
9. Click "Apply Changes"

### 4. Create Custom Skills

1. Go to the **Skills** tab in the side panel
2. Click "Create New Skill"
3. Name your skill (e.g., "Professional LinkedIn Posts")
4. Add instructions (e.g., "Write in a professional tone, use industry terminology")
5. Optionally set URL pattern to auto-activate (e.g., `*linkedin.com*`)
6. Save and activate the skill

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Development Mode

```bash
# Watch mode - rebuilds on file changes
npm run dev
```

After making changes, reload the extension in `chrome://extensions/`

### Production Build

```bash
npm run build
```

### Testing

```bash
# Run unit tests
npm test
```

Test on real websites:

- Gmail: Compose email
- LinkedIn: Create post
- Twitter: Write tweet
- Any form-heavy website

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Adding a New Language

1. Copy `src/shared/translations/en.json` to `[lang-code].json`
2. Translate all strings
3. Update `src/shared/i18n.ts` to register the language
4. Test thoroughly
5. Submit a PR

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions.

## ❓ FAQ

### Is my data safe?

Yes! Sireno uses your own API keys and sends data directly to your chosen AI provider (OpenAI, Anthropic, or Google). No data passes through our servers.

### How much does it cost?

Sireno is free and open source. You only pay for the AI API usage through your own provider account:

- **Groq**: FREE tier available (no credit card required)
- **OpenAI**: Pay-as-you-go ($0.01-0.10 per request depending on model)
- **Anthropic**: Pay-as-you-go (similar pricing to OpenAI)
- **Google**: Free tier available, then pay-as-you-go

### Which AI providers are supported?

- **Groq** (FREE tier): Llama 3.1 8B Instant, Llama 3.3 70B, Gemma 2 9B, DeepSeek R1
- **OpenAI**: GPT-5.2, GPT-5 Mini, GPT-4.1, GPT-4o, and more
- **Anthropic**: Claude Opus 4.6, Claude Sonnet 4.5, Claude Haiku 4.5
- **Google**: Gemini 3 Pro, Gemini 2.5 Pro/Flash, Gemini 2.0 Flash

**New in v0.2.0**: Each provider now remembers its own API key and model selection, so you can switch between providers seamlessly!

### Does it work on [specific website]?

Sireno is designed to work on ANY website with text inputs, textareas, or contenteditable elements. This includes Gmail, LinkedIn, Twitter, Notion, Slack, Discord, Reddit, and thousands more.

### Can I use it offline?

No, Sireno requires an internet connection to communicate with AI providers.

### The AI button doesn't appear on a field

Try clicking "Rescan" in the Fields tab, or manually focus the field. Some dynamic websites require rescanning after content loads.

## 🔐 Security & Privacy

- **Local Storage**: API keys stored locally using Chrome's secure storage
- **No Telemetry**: Zero tracking or analytics
- **No Third-Party Servers**: Direct connection to AI providers only
- **Optional Logging**: LLM logging is opt-in and stored locally
- **Open Source**: Full code available for security audit

## 📄 License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

This means:

- ✅ Free to use, modify, and distribute
- ✅ Must remain open source
- ✅ Changes must be documented
- ✅ Same license for derivatives

## 🙏 Credits

**Created by** [Sergio Carracedo](https://github.com/sergiocarracedo)

**Powered by:**

- [Vercel AI SDK](https://sdk.vercel.ai) - AI provider integration
- [React](https://react.dev) - UI framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Vite](https://vitejs.dev) - Build tool
- [Lucide](https://lucide.dev) - Icons

## ⭐ Support

If you find Sireno Assistant useful, please:

- ⭐ Star this repository
- 🐛 Report bugs via [GitHub Issues](https://github.com/sergiocarracedo/sireno-assistant/issues)
- 💡 Suggest features
- 🌍 Contribute translations
- 📢 Share with others

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/sergiocarracedo">Sergio Carracedo</a>
  <br><br>
  <a href="#-installation">Get Started</a> • 
  <a href="CONTRIBUTING.md">Contribute</a> • 
  <a href="https://github.com/sergiocarracedo/sireno-assistant/issues">Report Bug</a>
</div>
