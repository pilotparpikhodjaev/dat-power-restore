// loadboard.js - Specific transformations for the load board page

/**
 * Initialize load board transformation
 */
function initLoadBoardTransformation() {
  console.log("Initializing load board transformation");

  // Setup the observer to watch for load board elements
  const observer = window.setupLoadBoardObserver();

  // Also look for elements that are already present
  applyToExistingElements();

  // Set up controls for additional features
  setupRefreshButton();

  return observer;
}

/**
 * Apply transformations to elements that are already in the DOM
 */
function applyToExistingElements() {
  // Find relevant selectors - update these based on your actual page structure
  const loadBoardSelectors = [
    ".load-board-table",
    "#load-board",
    '[data-testid="load-board-container"]',
    // Add more specific selectors from your actual page
  ];

  // Try each selector
  for (const selector of loadBoardSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(
        `Found ${elements.length} load board elements with selector: ${selector}`
      );
      elements.forEach((element) => {
        window.transformLoadBoard(element);
      });
      break; // Stop once we've found matching elements
    }
  }
}

/**
 * Setup refresh button functionality
 */
function setupRefreshButton() {
  // This will handle adding the auto-refresh feature
  console.log("Setting up refresh button functionality");

  // Look for the age column header which often has a refresh button
  const ageHeaders = document.querySelectorAll(
    '[aria-label*="Age"], [title*="Age"], th:contains("Age")'
  );

  if (ageHeaders.length > 0) {
    console.log("Found Age column header for refresh functionality");

    // Create our own refresh button if needed
    const refreshButton = document.createElement("button");
    refreshButton.className = "legacy-refresh-button";
    refreshButton.textContent = "↻";
    refreshButton.title = "Refresh Loads";
    refreshButton.addEventListener("click", () => {
      // Find and click the original refresh button or trigger refresh in another way
      const originalRefreshButton = document.querySelector(
        '.refresh-button, [aria-label*="refresh"], [title*="refresh"]'
      );
      if (originalRefreshButton) {
        originalRefreshButton.click();
      } else {
        // Alternative: Simulate sorting by Age column which often refreshes the data
        const ageHeader = ageHeaders[0];
        ageHeader.click();
      }
    });

    // Add to the page, next to the Age header
    ageHeaders[0].appendChild(refreshButton);
  }
}

// Start the transformation
const observer = initLoadBoardTransformation();

// Export for access from other scripts
window.loadBoardObserver = observer;
