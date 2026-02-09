# Changelog

All notable changes to Sireno Assistant will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## [Unreleased]

### Planned
- More language translations (French, German, etc.)
- Custom field selection patterns
- Import/Export skills in JSON format
- Batch operations on multiple skills
- Field preview before applying changes
- Undo/Redo for field changes
- Dark mode support
- Custom themes

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
