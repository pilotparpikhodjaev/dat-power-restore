// popup.js - Functionality for the extension popup

document.addEventListener("DOMContentLoaded", function () {
  // Get UI elements
  const toggleUI = document.getElementById("toggle-ui");
  const statusDiv = document.getElementById("status");
  const refreshButton = document.getElementById("refresh-page");

  // Get the current tab
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];
    const url = currentTab.url;

    // Check if we're on a DAT page
    const isDATPage = url.includes("dat.com");

    if (!isDATPage) {
      statusDiv.classList.remove("active");
      statusDiv.innerHTML =
        "Not on a DAT page. Visit <strong>dat.com</strong> to use this extension.";
      toggleUI.disabled = true;
      refreshButton.disabled = true;
      return;
    }

    // Get current settings
    chrome.storage.sync.get(
      {
        enableLegacyUI: true,
        enableAutoRefresh: false,
        enableTollCalculation: false,
      },
      function (items) {
        // Update UI based on stored settings
        toggleUI.checked = items.enableLegacyUI;
        document.getElementById("auto-refresh").checked =
          items.enableAutoRefresh;
        document.getElementById("toll-calculation").checked =
          items.enableTollCalculation;

        // Update status message
        updateStatus(items.enableLegacyUI);
      }
    );
  });

  // Toggle UI event handler
  toggleUI.addEventListener("change", function () {
    const enabled = this.checked;

    // Save setting
    chrome.storage.sync.set(
      {
        enableLegacyUI: enabled,
      },
      function () {
        // Update status
        updateStatus(enabled);

        // Refresh the current tab to apply changes
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.reload(tabs[0].id);
          }
        );
      }
    );
  });

  // Refresh button event handler
  refreshButton.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.reload(tabs[0].id);
    });
  });

  // Helper function to update status message
  function updateStatus(enabled) {
    if (enabled) {
      statusDiv.classList.add("active");
      statusDiv.innerHTML = "Legacy UI is <strong>active</strong> on this page";
    } else {
      statusDiv.classList.remove("active");
      statusDiv.innerHTML = "Legacy UI is <strong>disabled</strong>";
    }
  }
});
