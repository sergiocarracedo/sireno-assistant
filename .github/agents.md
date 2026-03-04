# Agent Instructions for Sireno Assistant Project

## Website Design Decisions

### No Emojis Policy

**Decision:** Do NOT use emojis anywhere on the website (packages/web).

**Rationale:**

- Emojis can render inconsistently across different browsers and operating systems
- SVG icons provide better visual consistency and professionalism
- Icons can be styled (color, size, stroke) to match the design system
- Better accessibility support with proper aria labels

**Implementation:**

- Use Lucide icons (inline SVG) for all visual elements
- Icon colors should use the purple theme: `text-purple-400` or similar
- Icons should be wrapped in containers with background: `bg-purple-500/20 rounded-lg`
- Standard icon size: 24x24 for inline, larger for section headers

**Examples:**

```astro
<!-- ❌ DON'T: Use emojis -->
<span class="text-4xl">📦</span>

<!-- ✅ DO: Use SVG icons -->
<div class="w-12 h-12 flex items-center justify-center bg-purple-500/20 rounded-lg">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-400">
    <path d="M..."/>
  </svg>
</div>
```

### Icon Mapping Reference

Common icons to use instead of emojis:

- 📦 Package → `<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>`
- ⚙️ Settings → `<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>`
- 🔑 Key → `<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>`
- 💡 Lightbulb → `<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>`
- 💬 Chat → `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`
- ⚡ Zap → `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`
- 🔄 Refresh → `<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>`
- 🚀 Rocket → `<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>`
- 🔧 Wrench → `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`
- 🎉 Party → `<path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><circle cx="12" cy="12" r="2"/><path d="m4.5 9.5 6-6"/><path d="m19.5 14.5-6 6"/>`
- 🔒 Lock → `<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`
- 🔔 Bell → `<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>`
- 🔵 Circle → `<circle cx="12" cy="12" r="10"/>`
- 🚫 Ban → `<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>`
- 📖 Book → `<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>`
- 📝 FileText → `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>`
- 🌐 Globe → `<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>`
- 🔗 Link → `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`
- 🔐 Lock with Key → `<circle cx="12" cy="16" r="1"/><rect width="18" height="12" x="3" y="10" rx="2"/><path d="M7 10V7a5 5 0 0 1 9.33-2.5"/>`
- 💾 Save → `<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>`
- 👶 Baby → `<circle cx="12" cy="12" r="10"/><path d="M12 6a4 4 0 0 0-4 4c0 1.5 1 2 2 2s2-.5 2-2c0-1 0-2-1-2s-2 1-2 2"/><path d="M12 18v-4"/>`
- 📋 Clipboard → `<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>`

### Design System Colors

- Primary action: `bg-gradient-to-r from-purple-600 to-blue-600`
- Icon color: `text-purple-400`
- Icon background: `bg-purple-500/20`
- Glass effect: `glass` class (defined in custom.css)
- Borders: `border-2 border-white` for CTAs
- Text shadow: `[text-shadow:0_2px_24px_rgba(0,0,0,0.8)]` for hero text

## Other Website Guidelines

### Logo

- Always use white color: `color="#fff"`
- Sireno bird/siren SVG (from packages/extension/public/icons/logo.svg)

### AI Provider Models (Keep Updated)

- OpenAI: GPT-4o, GPT-4
- Anthropic: Sonnet 4.6, Haiku 4.6
- Google: Gemini Pro, Flash
- Groq: Llama 3, Mixtral (FREE tier)

### Contact Information

- GitHub: https://github.com/sergiocarracedo/sireno-assistant
- Email: hi@sergiocarracedo.es
- Author: Sergio Carracedo
- Chrome Web Store: https://chromewebstore.google.com/detail/ppnecnomfnadhbcpacgkfldiapoejogo

### Buttons

- All CTA buttons must have: `border-2 border-white`
- Gradient background for primary actions
- Glass effect for secondary actions

### Contrast

- Hero headline "Your Keys, Your Privacy" uses: `bg-white text-slate-950` (not gradient)
- Increased text shadows for better readability over shader background
