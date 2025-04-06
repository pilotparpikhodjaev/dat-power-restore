// background.js - Background service worker for the extension

// Default settings
const defaultSettings = {
  enableLegacyUI: true,
  enableAutoRefresh: false,
  enableTollCalculation: false,
  refreshInterval: 30, // seconds
  lastRefresh: null,
};

// Initialize settings on install
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.get(defaultSettings, function (items) {
    // Merge with defaults and save
    chrome.storage.sync.set({
      enableLegacyUI: items.enableLegacyUI ?? defaultSettings.enableLegacyUI,
      enableAutoRefresh:
        items.enableAutoRefresh ?? defaultSettings.enableAutoRefresh,
      enableTollCalculation:
        items.enableTollCalculation ?? defaultSettings.enableTollCalculation,
      refreshInterval: items.refreshInterval ?? defaultSettings.refreshInterval,
      lastRefresh: items.lastRefresh ?? defaultSettings.lastRefresh,
    });
  });

  // Set up context menu
  chrome.contextMenus.create({
    id: "toggle-legacy-ui",
    title: "Toggle Legacy UI",
    contexts: ["page"],
    documentUrlPatterns: ["https://*.dat.com/*"],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "toggle-legacy-ui") {
    chrome.storage.sync.get("enableLegacyUI", function (items) {
      const newValue = !items.enableLegacyUI;

      chrome.storage.sync.set(
        {
          enableLegacyUI: newValue,
        },
        function () {
          // Reload the tab to apply changes
          chrome.tabs.reload(tab.id);
        }
      );
    });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getSettings") {
    chrome.storage.sync.get(defaultSettings, function (items) {
      sendResponse(items);
    });
    return true; // Indicates we will send a response asynchronously
  }

  if (request.action === "saveSettings") {
    chrome.storage.sync.set(request.settings, function () {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "calculateToll") {
    // This would be implemented in the future
    // For now, just return a placeholder response
    sendResponse({
      success: true,
      toll: 0,
      message: "Toll calculation not yet implemented",
    });
    return true;
  }
});

// Setup auto-refresh functionality (future feature)
// This would set up a periodic task to refresh tabs with DAT load boards
// For example:
/*
function setupAutoRefresh() {
  // Check settings
  chrome.storage.sync.get(['enableAutoRefresh', 'refreshInterval'], function(items) {
    if (items.enableAutoRefresh) {
      // Set up alarm for refresh
      chrome.alarms.create('refreshLoadBoard', {
        periodInMinutes: items.refreshInterval / 60
      });
    } else {
      // Clear any existing alarms
      chrome.alarms.clear('refreshLoadBoard');
    }
  });
}

// Handle alarm events
chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === 'refreshLoadBoard') {
    // Find DAT tabs and refresh them
    chrome.tabs.query({url: "https://*.dat.com/*"}, function(tabs) {
      for (const tab of tabs) {
        // Send message to content script to trigger refresh
        chrome.tabs.sendMessage(tab.id, {action: "triggerRefresh"});
      }
    });
  }
});
*/
