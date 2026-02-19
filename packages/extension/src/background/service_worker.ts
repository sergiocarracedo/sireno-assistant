import { handleMessage } from "./message-handler";
import { cleanupOldChats } from "./storage";
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

// Open sidepanel when clicking the extension icon
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    await chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Handle messages from content scripts and side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep the message channel open for async response
});

// Cleanup old chats on startup
cleanupOldChats().then(() => {
  logger.info("Cleanup completed");
});

logger.info("Ready");
