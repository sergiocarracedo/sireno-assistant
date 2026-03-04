# Testing Side Panel Button Feature

## Overview

This document describes how to test the "Open in side panel" button feature in the inline chat.

## What's New

- Added a **PanelRight** button in the inline chat header
- Clicking the button:
  1. Saves the current message to chrome.storage
  2. Closes the inline chat
  3. Shows a notification telling the user to click the extension icon
  4. Sets a blue badge "1" on the extension icon
- When the user clicks the extension icon:
  1. The side panel opens
  2. The saved message appears in the chat input
  3. The badge is cleared

## User Flow

```
1. User types message in inline chat
   ↓
2. User clicks "Open in side panel" button (PanelRight icon)
   ↓
3. Inline chat closes
   ↓
4. Blue notification appears: "Message saved! Click the Sireno extension icon..."
   ↓
5. Extension icon shows blue badge "1"
   ↓
6. User clicks extension icon
   ↓
7. Side panel opens with the message pre-filled
   ↓
8. Badge "1" disappears
```

## Testing Steps

### Prerequisites

1. Build the extension: `pnpm run build` (from `packages/extension/`)
2. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `packages/extension/dist/`

### Test Case 1: Basic Flow

1. Navigate to any webpage (e.g., `test/fixtures/test-page.html`)
2. Click on any input field to open the inline chat
3. Type a message: "Hello from inline chat"
4. Click the **PanelRight** button in the inline chat header
5. **Verify**: Inline chat closes
6. **Verify**: Blue notification appears in top-right corner
7. **Verify**: Extension icon shows blue badge "1"
8. Click the Sireno extension icon
9. **Verify**: Side panel opens
10. **Verify**: The message "Hello from inline chat" appears in the chat input
11. **Verify**: Badge "1" disappears from extension icon

### Test Case 2: Empty Message

1. Click on any input field
2. Don't type anything (leave input empty)
3. Click the **PanelRight** button
4. **Verify**: Inline chat closes
5. **Verify**: Notification appears
6. Click the extension icon
7. **Verify**: Side panel opens with empty input

### Test Case 3: Message with Field Context

1. Click on a specific input field (e.g., "Name")
2. Type a message: "Fill this with a fake name"
3. Click the **PanelRight** button
4. Click the extension icon
5. **Verify**: Side panel opens
6. **Verify**: Message appears in input
7. **Verify**: The field "Name" is selected in the Fields view (if applicable)

### Test Case 4: Notification Auto-Dismiss

1. Click on any field and type a message
2. Click the **PanelRight** button
3. **Verify**: Notification appears
4. Wait 5 seconds
5. **Verify**: Notification slides out and disappears

### Test Case 5: Message Expiry

1. Click on any field and type a message
2. Click the **PanelRight** button
3. Wait **more than 5 seconds**
4. Click the extension icon
5. **Verify**: Side panel opens but input is **empty** (message expired)
6. **Verify**: Badge still clears

### Test Case 6: Already Open Side Panel

1. Open the side panel first (click extension icon)
2. Navigate to a webpage
3. Click on a field and type a message in inline chat
4. Click the **PanelRight** button
5. **Verify**: Message appears in side panel immediately (no need to click icon again)

## Expected Behavior

### UI Elements

- **Button Icon**: PanelRight from lucide-react
- **Button Tooltip**: "Open in side panel for full chat"
- **Button Position**: In the inline chat header, next to other controls
- **Badge Color**: Blue (#4285F4)
- **Badge Text**: "1"
- **Notification Color**: Blue (#4285F4)
- **Notification Position**: Top-right corner
- **Notification Duration**: 5 seconds

### Edge Cases

- ✅ Message expires after 5 seconds
- ✅ Badge clears when side panel opens
- ✅ Notification auto-dismisses
- ✅ Works with empty messages
- ✅ Works when side panel is already open
- ✅ Field context is preserved

## Technical Details

### Files Modified

1. `src/content/components/InlineChatApp.tsx`
   - Added PanelRight button with click handler
2. `src/content/iframe-chat.ts`
   - Added `handleOpenSidePanel()` function
   - Added `showExtensionIconNotification()` function
3. `src/background/message-handler.ts`
   - Updated `SEND_TO_SIDEBAR` handler to set badge
4. `src/sidepanel/views/chat/ChatView.tsx`
   - Added badge clearing when message is retrieved

### Storage Schema

```typescript
{
  sidebar_pending_message: {
    message: string;
    fieldId?: string;
    timestamp: number; // Date.now()
  }
}
```

### Message Expiry

- Messages are valid for **5 seconds** (5000ms)
- After 5 seconds, the side panel ignores the pending message
- This prevents old messages from appearing unexpectedly

## Troubleshooting

### Badge doesn't appear

- Check browser console for errors
- Verify `chrome.action.setBadgeText` permission is available
- Check that the message was actually saved to storage

### Notification doesn't show

- Check for CSS conflicts with the host page
- Verify z-index is high enough (2147483647)
- Check browser console for errors

### Message doesn't appear in side panel

- Check if more than 5 seconds passed (message expired)
- Verify storage contains `sidebar_pending_message`
- Check browser console in side panel for errors

### Badge doesn't clear

- Check that `chrome.action.setBadgeText({ text: "" })` is being called
- Verify the side panel ChatView component loaded correctly

## Known Limitations

1. **User Gesture Requirement**: Chrome doesn't allow programmatically opening the side panel from content scripts, so we use a notification + badge approach instead
2. **Message Expiry**: Messages expire after 5 seconds to prevent confusion
3. **Single Message**: Only one pending message can be stored at a time (new messages overwrite old ones)

## Success Criteria

- ✅ User can transfer messages from inline chat to side panel
- ✅ User receives clear visual feedback (notification + badge)
- ✅ UX is smooth and intuitive
- ✅ No Chrome extension errors
- ✅ Messages don't persist longer than intended
