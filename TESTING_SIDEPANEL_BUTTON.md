# Testing: Open Side Panel from Inline Chat

## Feature Description

Added a button to the inline chat header that opens the side panel with the current message pre-filled.

## How to Test

### 1. Load the Extension

```bash
cd packages/extension
npm run build
```

Then in Chrome:

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `packages/extension/dist`

### 2. Test the Feature

1. **Go to any website with a form field** (e.g., Gmail, Twitter, etc.)

2. **Open the inline chat**:
   - Hover over or click on an input field
   - Click the Sireno assistant button that appears
   - OR press `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac)

3. **Type a message** in the inline chat (optional)

4. **Click the side panel icon** (📋 PanelRight icon) in the header
   - It's located between the pin icon and the close button
   - Tooltip says: "Open in side panel for full chat"

5. **Expected behavior**:
   - The side panel should open on the right side of the browser
   - If you had a message typed, it should appear in the side panel's input field
   - The inline chat should close
   - The field you were editing should be selected in the side panel

### 3. Check Browser Console

Open the browser console (F12) and check for these logs:

**When clicking the button:**

```
[InlineChatApp] Opening side panel { fieldId: "...", message: "..." }
[iframe-chat] Received message from iframe: open-sidepanel { ... }
[IFrame Chat] Opening side panel for field: ... with message: ...
```

**In the background service worker console** (`chrome://extensions/` → Sireno Assistant → "service worker"):

```
Opening sidebar (general)
Sidebar opened successfully
Sending message to sidebar: ...
```

**In the side panel (when it opens):**

```
Checking for pending message
```

## Troubleshooting

### Button doesn't respond to clicks

- Check browser console for errors
- Make sure you're clicking the button, not dragging the header
- The `onMouseDown` event on buttons should stop propagation

### Side panel doesn't open

- Check the service worker console for errors
- Make sure the extension has permission to open side panel
- Try manually opening the side panel first (click extension icon)

### Message doesn't appear in side panel

- Check if the message was sent (console logs)
- The message should appear within 5 seconds (timeout check)
- Check `chrome.storage.local` for `sidebar_pending_message` key

### Debugging Storage

To check if the message is being stored:

```javascript
// In browser console
chrome.storage.local.get("sidebar_pending_message", (result) => {
  console.log("Pending message:", result);
});
```

## Implementation Details

### Message Flow

1. User clicks PanelRight button in inline chat
2. `InlineChatApp.tsx` → `handleOpenSidePanel()` posts message to parent
3. `iframe-chat.ts` → `handleOpenSidePanel()` receives message
4. Sends `OPEN_SIDEBAR` message to background script
5. Sends `SEND_TO_SIDEBAR` message with the text
6. Background script stores message in `chrome.storage.local`
7. Background script opens the side panel
8. `ChatView.tsx` checks for pending message on mount
9. Message is displayed and storage is cleared

### Files Modified

- `packages/extension/src/content/components/InlineChatApp.tsx` - Added button and handler
- `packages/extension/src/content/iframe-chat.ts` - Added `handleOpenSidePanel()`
- `packages/extension/src/background/message-handler.ts` - Added `OPEN_SIDEBAR` and `SEND_TO_SIDEBAR` handlers
- `packages/extension/src/sidepanel/views/chat/ChatView.tsx` - Added pending message check
- `packages/extension/src/shared/messages.ts` - Added new message types

### Known Issues

- None currently

## Next Steps

If the feature works correctly, consider:

- Adding animation/transition when opening
- Showing a loading state while opening
- Adding keyboard shortcut (e.g., Ctrl+Shift+P)
- Preserving the full chat context, not just the message
