# Changelog

All notable changes to Sireno Assistant will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-02-10

### Added

- 🆓 **Groq Provider Support**: Added Groq as a 4th AI provider with FREE tier access
  - Get free API keys at https://console.groq.com/keys
  - Ultra-fast inference with Llama 3.1 8B Instant model
  - Support for Llama 3.3 70B, Gemma 2 9B, and DeepSeek R1 models
  - "FREE TIER" badge displayed in provider dropdown
- **Provider-Specific Configuration**: Each provider now remembers its own API key and model
  - Switch between providers seamlessly without losing credentials
  - Settings are preserved per provider
  - Automatic migration from v0.1.0 config format

### Changed

- **Default Provider**: Changed from OpenAI to Groq (free tier option)
- **Settings UI**: Enhanced provider selector with inline badges
- **Config Storage**: Migrated from flat structure to nested `providerConfigs` object
  - Old format: `{ provider, model, apiKey, ... }`
  - New format: `{ provider, providerConfigs: { groq: {...}, openai: {...}, ... }, ... }`

### Fixed

- Provider switching now preserves API keys and model selections
- Badge display moved from below selector to inside dropdown options

### Migration

- Existing users from v0.1.0 will be automatically migrated on first load
- Your current provider, model, and API key will be preserved
- Other providers will start with empty API keys
- No user action required

### Technical

- Added `ProviderConfig` interface for per-provider settings
- Enhanced Select component with badge support using Radix UI
- Updated storage layer with `migrateConfig()` function
- All TypeScript compilation successful with strict mode

## [0.1.0] - 2026-02-09

### Added

- 🎉 **Initial public release**
- **Inline AI Chat**: Click the AI button on any field to get instant assistance
- **Multi-Field Form Filling**: Select multiple fields and fill them all at once with AI
- **Skills System**: Create custom AI behaviors for different websites
- **Multi-Provider Support**: Use OpenAI, Anthropic (Claude), or Google (Gemini)
- **Context Levels**: 5 levels of context (none/domain/url/selected/allPage)
- **i18n Support**: English and Spanish languages with easy language switching
- **Language Selector**: Choose your preferred language in Settings
- **LLM Logging**: Optional transparency logging to see what data is sent to LLMs
- **Dynamic Field Detection**: Automatically detects fields added dynamically (SPAs, modals)
- **ContentEditable Support**: Works with rich text editors like Gmail, Notion
- **Privacy-First Design**: Uses your own API keys, no data sent to third parties
- **Field Management**: Exclude/restore fields, scan for new fields
- **Modern UI**: Beautiful side panel with professional design
- **Keyboard Shortcuts**: `Ctrl+Shift+F` (Mac: `Cmd+Shift+F`) to open side panel

### Technical Features

- **IFrame Isolation**: Strong isolation for inline chat to prevent focus issues
- **Grammarly-Style Button**: Smart button positioning inside field wrappers
- **Multi-Strategy Detection**: 5 parallel field detection strategies
- **Capture-Phase Focus**: Bypasses `stopPropagation()` on sites like LinkedIn/Bluesky
- **Mutation Observer**: Detects DOM changes for SPA support
- **Intersection Observer**: Handles lazy-loaded content
- **Lucide Icons**: Modern icon system throughout UI

### Fixed

- Focus trap issues on Bluesky and LinkedIn
- Button positioning in modals and complex layouts
- Dynamic field detection in single-page applications
- ContentEditable field support

### Developer Features

- TypeScript with strict mode
- React 18 with hooks
- Vite build system
- Vitest for testing
- Comprehensive type safety with Zod schemas
- Clean architecture with separation of concerns

---

## Release Notes

### Version 0.1.0 - Initial Release

This is the first public release of Sireno Assistant! 🎉

**What makes Sireno different?**

- **Privacy**: Your API keys, your data, your control
- **Flexibility**: Works on ANY website, not just specific platforms
- **Power**: Full access to latest AI models (GPT-5, Claude Opus 4, Gemini 3)
- **Customization**: Skills system lets you tailor AI behavior per website
- **Transparency**: Optional logging shows exactly what's sent to LLMs

**Known Limitations:**

- Currently supports 2 languages (English, Spanish)
- Manual field scanning required on some dynamic sites
- Some complex websites may require field rescanning

**Getting Started:**

1. Install from Chrome Web Store
2. Add your API key in Settings
3. Visit any webpage with forms
4. Click the AI button or use the side panel
5. Start filling forms with AI!

**Feedback Welcome:**
This is our first release! Please report bugs, suggest features, and share your experience:

- GitHub Issues: https://github.com/sergiocarracedo/sireno-assistant/issues
- Email: hi@sergiocarracedo.es

Thank you for trying Sireno Assistant!
