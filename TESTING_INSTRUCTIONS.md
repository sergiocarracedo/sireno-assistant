# Sireno Assistant - Testing Instructions

Thank you for helping test Sireno Assistant! 🙏

## What is Sireno Assistant?

Sireno Assistant is an AI-powered Chrome extension that helps you fill web forms intelligently. It adds a small AI assistant button next to any input field on any website. Click it, describe what you want in natural language, and let AI fill the form for you.

## Installation (5 minutes)

### Step 1: Download & Extract
1. Download the `sireno-assistant-test.zip` file
2. Extract the ZIP file to a folder on your computer
3. Remember the location (you'll need it in Step 3)

### Step 2: Enable Developer Mode in Chrome
1. Open Chrome (or any Chromium browser like Edge, Brave, etc.)
2. Go to: `chrome://extensions/` (or type it in the address bar)
3. Toggle **Developer mode** ON (switch in top-right corner)

### Step 3: Install the Extension
1. Click the **"Load unpacked"** button
2. Navigate to the folder where you extracted the ZIP
3. Select that folder and click "Select"
4. ✅ The extension should now appear in your extensions list!

### Step 4: Configure Your API Key

**⚠️ Important**: You need your own API key from one of these providers:
- **OpenAI**: https://platform.openai.com/api-keys (GPT-4, GPT-3.5)
- **Anthropic**: https://console.anthropic.com/settings/keys (Claude)
- **Google AI**: https://aistudio.google.com/app/apikey (Gemini)

If you don't have an API key, you'll need to create a free account with one of these providers.

**Setup:**
1. Click the Sireno Assistant icon in your browser toolbar (purple icon)
2. Click the **Settings** icon (⚙️) at the top
3. Select your AI Provider (OpenAI, Anthropic, or Google)
4. Paste your API key
5. (Optional) Choose your preferred model
6. Click **"Save Configuration"**
7. ✅ You should see a green checkmark confirming your settings are saved!

## How to Use

### Basic Usage
1. Visit any website with forms (Gmail, Twitter, LinkedIn, Google Forms, etc.)
2. Look for the purple **✨ sparkle icon** next to input fields
3. Click the icon to open the AI assistant
4. Type what you want in natural language
5. AI will suggest changes - review and apply them!

### Examples to Try

**Email Reply (Gmail/Outlook):**
- "Write a polite reply declining this meeting"
- "Thank them and ask for more details"
- "Write a professional follow-up email"

**Social Media (Twitter/LinkedIn):**
- "Write a tweet about AI in healthcare"
- "Make this sound more professional"
- "Summarize this article in 280 characters"

**Forms:**
- "Fill this with my professional bio"
- "Generate a creative company description"
- "Write why I want to join this program"

**Context-Aware Help:**
- The AI can see other fields on the page
- Try: "Fill all fields with demo data"
- Try: "Make this consistent with the other answers"

## Features to Test

### 1. **Inline Chat**
- Click the ✨ icon on any input field
- Chat with AI about what you want to fill in
- Apply suggestions with one click

### 2. **Context Levels**
Check Settings → Context Level:
- **None**: AI has no context (fast, cheap)
- **Domain**: AI knows what website you're on
- **URL**: AI knows the specific page
- **Selected Fields**: AI sees the fields you selected
- **All Page**: AI can see the entire page content

### 3. **Skills System**
Go to the "Skills" tab to:
- Create custom AI behaviors for specific websites
- Example: "Always be formal on LinkedIn, casual on Twitter"
- Enable/disable skills per website

### 4. **Field Exclusion**
- Right-click the ✨ button to exclude sensitive fields
- Excluded fields won't be sent to AI
- View excluded fields in the "Fields" tab

### 5. **Multi-Language Support**
- Try Settings → Language
- Switch between English and Spanish
- All UI updates automatically

## What to Test & Report

### ✅ Things to Check:
- [ ] Extension installs correctly
- [ ] Settings save and API key works
- [ ] ✨ button appears on input fields
- [ ] AI responses are helpful and accurate
- [ ] Applying changes works correctly
- [ ] Multiple fields can be selected
- [ ] Context levels affect AI responses appropriately
- [ ] Skills can be created and work as expected
- [ ] Field exclusion works
- [ ] Language switching works
- [ ] Works on different websites (Gmail, Twitter, forms, etc.)

### 🐛 Please Report:
- **Bugs**: Anything that doesn't work or crashes
- **UX Issues**: Confusing interface, hard to understand
- **Performance**: Slow responses, laggy UI
- **Website Compatibility**: Websites where it doesn't work
- **AI Quality**: Bad suggestions, incorrect context
- **Missing Features**: Things you expected but aren't there

### 📝 How to Report Issues:
When reporting issues, please include:
1. What you were trying to do
2. What happened (actual behavior)
3. What you expected to happen
4. Which website you were on
5. Screenshots if possible
6. Browser console errors (if any):
   - Press F12 → Console tab
   - Take a screenshot of any red errors

## Privacy & Security

- **Your data**: Never stored on our servers
- **API keys**: Stored locally in your browser only
- **AI calls**: Sent directly to your chosen AI provider (OpenAI/Anthropic/Google)
- **Open Source**: Full code is available for review
- **No tracking**: No analytics, no telemetry

## Tips for Testing

1. **Start simple**: Try basic "write a reply" commands first
2. **Test different sites**: Gmail, Twitter, LinkedIn, forms, etc.
3. **Try context levels**: See how different context affects responses
4. **Create a skill**: Try making a custom rule for a website
5. **Test edge cases**: Very long text, special characters, multiple fields
6. **Check excluded fields**: Exclude a field and verify AI doesn't see it

## Troubleshooting

### "Extension context invalidated"
- This happens after updating the extension
- Solution: Refresh the webpage

### "No fields detected"
- The website might use unusual input fields
- Try refreshing the page
- Report which website has this issue

### "API key invalid"
- Double-check you copied the full key (no spaces)
- Verify the key is active in your AI provider's dashboard
- Make sure you selected the correct provider

### Button not appearing
- Refresh the page
- Check if Developer Mode is still enabled
- Try on a different website (e.g., gmail.com)

## Need Help?

Feel free to reach out with any questions or issues!

Thank you for testing! Your feedback will help make Sireno Assistant better for everyone. 🚀
