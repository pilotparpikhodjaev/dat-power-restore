// content.js - Targeted for DAT One custom components

console.log("DAT Power Legacy UI: Content script loaded");

// Global flag to track if we've successfully applied styles
let stylesApplied = false;

// Add visual indicator that our extension is active
function addVisualIndicator() {
  if (document.getElementById("dat-power-legacy-indicator")) {
    return; // Already exists
  }

  if (document.body) {
    const indicator = document.createElement("div");
    indicator.id = "dat-power-legacy-indicator";
    indicator.textContent = "DAT Power Legacy UI Active";
    indicator.style.position = "fixed";
    indicator.style.top = "0";
    indicator.style.right = "0";
    indicator.style.backgroundColor = "red";
    indicator.style.color = "white";
    indicator.style.padding = "5px";
    indicator.style.zIndex = "9999";
    document.body.appendChild(indicator);
    console.log("Added visual indicator");
  }
}

// Safely inject our CSS
function injectStyles() {
  try {
    // Only inject if not already present
    if (!document.getElementById("dat-power-legacy-css")) {
      // Try direct style element approach
      const style = document.createElement("style");
      style.id = "dat-power-legacy-css";
      style.textContent = `
        /* DAT Power Legacy UI Styles - Targeted for DAT One custom components */

        /* Global styles */
        body {
          font-family: Arial, sans-serif !important;
          font-size: 12px !important;
        }

        /* Target the custom DAT components */
        dat-search-table,
        dat-results-header,
        cdk-virtual-scroll-viewport {
          font-size: 12px !important;
          font-family: Arial, sans-serif !important;
        }

        /* Header styling */
        dat-results-header,
        dat-search-results-sort,
        dat-age-header,
        dat-rate-header,
        dat-route-header,
        dat-selection-header,
        dat-unread-header {
          background-color: #e6e6e6 !important;
          padding: 2px 4px !important;
          height: 24px !important;
          line-height: 24px !important;
          border-bottom: 1px solid #ccc !important;
          font-weight: bold !important;
          color: #000 !important;
          font-size: 12px !important;
        }

        /* Virtual scrolling container */
        cdk-virtual-scroll-viewport {
          border: 1px solid #ccc !important;
          background-color: white !important;
        }

        /* Row styling */
        cdk-virtual-scroll-viewport > div {
          height: 24px !important;
          line-height: 24px !important;
          border-bottom: 1px solid #ddd !important;
          padding: 0 !important;
          margin: 0 !important;
          background-color: white !important;
        }

        /* Alternating row colors */
        cdk-virtual-scroll-viewport > div:nth-child(even) {
          background-color: #f9f9f9 !important;
        }

        /* Cell components */
        dat-age,
        dat-rate,
        dat-route,
        dat-company,
        dat-factoring,
        dat-unread,
        dat-orig-dest-icon,
        dat-cell-divider {
          padding: 2px 4px !important;
          height: 24px !important;
          line-height: 24px !important;
          font-size: 12px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          border-right: 1px solid #ddd !important;
        }

        /* Style the checkbox to match old UI */
        dat-table-checkbox,
        mat-checkbox {
          height: 24px !important;
          line-height: 24px !important;
        }

        /* Make the Age display use the same font as the old UI */
        dat-age {
          font-family: monospace !important;
        }

        /* Make the Rate display green like the old UI */
        dat-rate {
          color: #006600 !important;
        }

        /* Adjust the origin/destination display */
        dat-route dat-orig-dest-icon {
          font-weight: bold !important;
        }

        /* Make sure material components match the old UI style */
        mat-chip-list,
        mat-chip,
        mat-form-field,
        mat-select {
          font-size: 12px !important;
          height: 24px !important;
          line-height: 24px !important;
        }

        /* Reduce padding/margins throughout the interface */
        dat-search-form * {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }

        /* Make buttons more compact */
        button {
          height: 24px !important;
          line-height: 24px !important;
          font-size: 12px !important;
          min-height: 24px !important;
        }

        /* Format the load details section */
        .load-details {
          border: 1px solid #ccc !important;
          padding: 8px !important;
          font-size: 12px !important;
          background-color: #f9f9f9 !important;
        }
      `;

      // Use documentElement as a fallback if head isn't available
      (document.head || document.documentElement).appendChild(style);
      console.log("Injected DAT Power legacy styles");

      stylesApplied = true;
    }
  } catch (err) {
    console.error("Error injecting styles:", err);
  }
}

// Set up a MutationObserver to watch for element changes
function setupObserver() {
  // Create an observer instance
  const observer = new MutationObserver((mutations) => {
    // Check if any mutations added nodes to the DOM
    const hasNewNodes = mutations.some(
      (mutation) => mutation.addedNodes.length > 0
    );

    if (hasNewNodes) {
      // Apply targeted transformations when new nodes are added
      applyTargetedTransformations();
    }
  });

  // Start observing the document with the configured parameters
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  console.log("Set up mutation observer");

  return observer;
}

// Apply targeted transformations without depending on external scripts
function applyTargetedTransformations() {
  console.log("Applying targeted transformations");

  try {
    // Target the search table component which is likely our main table
    const searchTables = document.querySelectorAll("dat-search-table");
    console.log(`Found ${searchTables.length} dat-search-table elements`);

    if (searchTables.length > 0) {
      // Add a class to the table for our CSS to target
      searchTables.forEach((table) => {
        table.classList.add("dat-power-legacy-table");
      });

      // Find column headers and style them
      const headerElements = document.querySelectorAll(
        "dat-results-header, dat-age-header, dat-rate-header, dat-route-header"
      );
      console.log(`Found ${headerElements.length} header elements`);

      headerElements.forEach((header) => {
        header.classList.add("dat-power-legacy-header");
        header.style.backgroundColor = "#e6e6e6";
        header.style.color = "#000";
        header.style.fontWeight = "bold";
        header.style.height = "24px";
        header.style.lineHeight = "24px";
      });

      // Find the virtual scroll viewport which contains our rows
      const scrollViewports = document.querySelectorAll(
        "cdk-virtual-scroll-viewport"
      );
      console.log(`Found ${scrollViewports.length} virtual scroll viewports`);

      scrollViewports.forEach((viewport) => {
        viewport.classList.add("dat-power-legacy-viewport");
        viewport.style.border = "1px solid #ccc";

        // Style rows inside the viewport
        const rows = viewport.children;
        console.log(`Found ${rows.length} direct children in viewport`);

        Array.from(rows).forEach((row, index) => {
          row.classList.add("dat-power-legacy-row");
          row.style.height = "24px";
          row.style.lineHeight = "24px";
          row.style.borderBottom = "1px solid #ddd";

          // Alternate row colors
          if (index % 2 === 0) {
            row.style.backgroundColor = "#ffffff";
          } else {
            row.style.backgroundColor = "#f9f9f9";
          }
        });
      });

      // Style specific cell types
      const cellTypes = ["dat-age", "dat-rate", "dat-route", "dat-company"];
      cellTypes.forEach((type) => {
        const cells = document.querySelectorAll(type);
        console.log(`Found ${cells.length} ${type} elements`);

        cells.forEach((cell) => {
          cell.classList.add("dat-power-legacy-cell");
          cell.style.padding = "2px 4px";
          cell.style.height = "24px";
          cell.style.lineHeight = "24px";
          cell.style.fontSize = "12px";
          cell.style.borderRight = "1px solid #ddd";

          // Apply cell-specific styling
          if (type === "dat-rate") {
            cell.style.color = "#006600"; // Green for rates
          }
        });
      });

      stylesApplied = true;
    }
  } catch (err) {
    console.error("Error in targeted transformations:", err);
  }
}

// Initialize the extension
function init() {
  console.log("DAT Power Legacy UI initializing...");

  try {
    // Check if we're on a DAT page
    const isDATPage = window.location.href.includes("dat.com");
    console.log("Is DAT page:", isDATPage);

    if (!isDATPage) {
      console.log("Not on a DAT page, skipping initialization");
      return;
    }

    // Add visual indicator
    addVisualIndicator();

    // Inject styles
    injectStyles();

    // Set up observer
    setupObserver();

    // Apply targeted transformations
    applyTargetedTransformations();

    // Also apply transformations periodically to catch dynamic content
    const transformInterval = setInterval(() => {
      if (!document.hidden) {
        applyTargetedTransformations();
      }
    }, 2000);

    // Create a longer interval that will eventually clear the transform interval
    setTimeout(() => {
      if (stylesApplied) {
        console.log("Styles applied successfully, stopping periodic checks");
        clearInterval(transformInterval);
      }
    }, 30000); // After 30 seconds, stop checking
  } catch (err) {
    console.error("Error in initialization:", err);
  }
}

// Run when the document is ready or after a delay
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    injectStyles();
    init();
  });
} else {
  injectStyles();
  init();
}

// Also try with a delay as a fallback
setTimeout(injectStyles, 500);
setTimeout(init, 1000);
setTimeout(addVisualIndicator, 1500);

// Set up an event listener for URL changes (for SPAs)
let lastUrl = location.href;
setInterval(() => {
  if (lastUrl !== location.href) {
    lastUrl = location.href;
    console.log("URL changed, re-initializing...");
    setTimeout(init, 500);
  }
}, 1000);
