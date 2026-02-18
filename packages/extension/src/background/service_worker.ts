import { handleMessage } from "./message-handler";
import { saveTabState, clearTabState, cleanupOldChats } from "./storage";
import { createLogger } from "../shared/logger";

const logger = createLogger("ServiceWorker");

logger.info("Initializing...");

// Open options page on first install for onboarding
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("src/options/index.html") + "?tab=settings&onboarding=true",
    });
  }
});

// Set side panel behavior to open on action click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
  logger.error("Failed to set panel behavior:", error);
});

// Track tabs where extension is active
const activeTabIds = new Set<number>();

// Handle toolbar icon click: mark tab as active
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  logger.info("Extension icon clicked for tab", tab.id);

  // Check if we can inject content script (not on chrome:// pages)
  const url = tab.url || "";
  const isRestrictedPage =
    url.startsWith("chrome://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.startsWith("chrome-extension://");

  if (isRestrictedPage) {
    logger.info("Cannot activate on restricted page:", url);
    return;
  }

  // Mark this tab as active (side panel toggle is handled automatically by Chrome)
  activeTabIds.add(tab.id);
  await saveTabState(tab.id, { hasActiveSession: true });
  logger.debug("Tab marked as active:", tab.id);

  // Note: Content script is auto-injected via manifest.json content_scripts
  // No need to inject programmatically here to avoid duplicate loading
});

// Handle tab switching: track state only (Chrome manages side panel visibility per-tab)
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  // Side panel state is automatically managed per-tab by Chrome
  // We just track which tabs have active sessions
  logger.debug("Tab activated:", tabId, "Active:", activeTabIds.has(tabId));
});

// Handle tab removal: cleanup state
chrome.tabs.onRemoved.addListener(async (tabId) => {
  activeTabIds.delete(tabId);
  await clearTabState(tabId);
  logger.debug("Cleaned up state for tab", tabId);
});

// Handle messages from side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle OPEN_SKILLS_TAB message
  if (message.type === "OPEN_SKILLS_TAB") {
    // Open side panel for the current tab
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.sidePanel
          .open({ tabId: activeTab.id })
          .then(() => {
            logger.info("Side panel opened for skills tab");
            // Send message to sidepanel to switch to skills tab
            chrome.runtime.sendMessage({ type: "SWITCH_TO_SKILLS_TAB" }).catch(() => {
              // Sidepanel might not be ready yet, that's ok
            });
          })
          .catch((error) => {
            logger.error("Failed to open side panel:", error);
          });
      }
    });
    sendResponse({ type: "SKILLS_TAB_OPENING" });
    return true;
  }

  // Handle async
  handleMessage(message, sender, sendResponse);
  return true; // Keep the message channel open for async response
});

// Cleanup old chats on startup
cleanupOldChats().then(() => {
  logger.info("Cleanup completed");
});

logger.info("Ready");
