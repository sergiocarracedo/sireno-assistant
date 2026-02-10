# Contributing to Sireno Assistant

Thank you for your interest in contributing to Sireno Assistant! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser version and OS
- Screenshots if applicable

### Suggesting Features

We love new ideas! Please open an issue with:
- A clear description of the feature
- Use cases and benefits
- Any implementation ideas you have

### Submitting Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/sergiocarracedo/sireno-assistant
   cd sireno-assistant
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed

4. **Test your changes**
   ```bash
   npm run build
   npm test
   # Load the extension in Chrome and test manually
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   
   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for code refactoring
   - `test:` for tests
   - `chore:` for maintenance

6. **Push and create a PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a Pull Request on GitHub.

## Adding a New Language

We welcome translations! To add a new language:

1. **Create translation file**
   ```bash
   cp src/shared/translations/en.json src/shared/translations/[lang-code].json
   ```

2. **Translate all strings** in your new file

3. **Update the i18n system**
   
   Edit `src/shared/i18n.ts`:
   ```typescript
   // Add your language to the type
   export type SupportedLanguage = 'en' | 'es' | 'fr' // add yours here
   
   // Import your translations
   import frTranslations from './translations/fr.json'
   
   // Register in the translations object
   const translations: Record<SupportedLanguage, Translations> = {
     en: enTranslations,
     es: esTranslations,
     fr: frTranslations, // add yours here
   }
   ```

4. **Update language selector**
   
   Edit `src/sidepanel/components/SettingsTab.tsx` to add your language option.

5. **Test thoroughly**
   - Switch to your language in Settings
   - Verify all UI strings appear correctly
   - Check for missing translations (should fallback to English)

6. **Submit a PR** with your translation

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Prefer functional React components with hooks
- Use existing patterns and components
- Keep functions small and focused
- Add JSDoc comments for complex functions

### Project Structure

```
src/
├── background/      # Service worker (background script)
├── content/         # Content scripts (injected into pages)
├── sidepanel/       # React UI (side panel)
└── shared/          # Shared types, utilities, translations

.meta/               # Project metadata (NOT in Git)
├── docs/            # Documentation for sharing
├── releases/        # Built packages
├── testing/         # Test plans and results
├── plans/           # Project planning docs
└── agents/          # AI agent collaboration files
```

**Note:** The `.meta` folder is gitignored and used for project management files that are not part of the extension. See `.meta/README.md` for details.

### Working with AI Agents

If you're using AI coding assistants (OpenCode, Copilot, Cursor, etc.):

- Read `.meta/agents/agents.md` for detailed guidelines
- Use `.meta` folder for test plans, documentation, and planning
- See `.meta/agents/quick-reference.md` for quick tips

### Testing

- Write unit tests for utility functions
- Test on multiple websites (Gmail, LinkedIn, Twitter, etc.)
- Test with different LLM providers (OpenAI, Anthropic, Google)
- Verify in both light and dark modes
- Test language switching

### Building

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Run tests
npm test
```

### Loading the Extension

1. Run `npm run build`
2. Open Chrome → `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/` directory

## Questions?

If you have questions about contributing, feel free to:
- Open an issue for discussion
- Ask in existing issues/PRs
- Check existing documentation

## Code of Conduct

Please be respectful and constructive in all interactions. We're here to build something great together!

## License

By contributing, you agree that your contributions will be licensed under the GPL-3.0 License.
