// loadboard-transformer.js - Core logic for transforming DAT One to DAT Power style

/**
 * Class that handles all transformations for the load board
 */
class LoadBoardTransformer {
  constructor() {
    // Column mappings from new UI to old UI
    this.columnMappings = {
      age: { width: "60px", align: "left", transform: this.transformAgeCell },
      pickup: {
        width: "70px",
        align: "left",
        transform: this.transformPickupCell,
      },
      origin: { width: "120px", align: "left" },
      destination: { width: "120px", align: "left" },
      trip: {
        width: "60px",
        align: "right",
        transform: this.transformTripCell,
      },
      "dh-o": { width: "60px", align: "center" },
      "dh-d": { width: "60px", align: "center" },
      equipment: { width: "80px", align: "left" },
      truck: { width: "60px", align: "center" },
      "f/p": { width: "50px", align: "center" },
      rate: {
        width: "80px",
        align: "right",
        transform: this.transformRateCell,
      },
      weight: {
        width: "80px",
        align: "right",
        transform: this.transformWeightCell,
      },
      length: { width: "70px", align: "right" },
      company: { width: "150px", align: "left" },
      contact: { width: "150px", align: "left" },
      cs: { width: "50px", align: "center" },
      dtp: { width: "50px", align: "center" },
      factor: { width: "60px", align: "center" },
      book: { width: "60px", align: "center" },
    };

    // Reference to observers that we create
    this.observers = [];
  }

  /**
   * Initialize the transformer
   */
  init() {
    console.log("Initializing LoadBoardTransformer");

    // Setup observers for dynamic content
    this.setupObservers();

    // Try to transform any existing load board elements
    this.transformExistingElements();

    // Handle expanded view transformation
    this.setupExpandedViewHandler();

    // Add custom refresh button
    this.setupRefreshButton();

    // Hide new UI elements
    this.hideNewUIElements();
  }

  /**
   * Transform any load board elements that already exist in the page
   */
  transformExistingElements() {
    const loadBoard = window.DOMFinder.findLoadBoardTable();
    if (loadBoard) {
      console.log("Found existing load board table:", loadBoard);
      this.transformLoadBoardTable(loadBoard);
    } else {
      console.log("No existing load board table found");
    }

    // Try to find the results count element and transform it
    const resultsCountElements = document.querySelectorAll(
      '[data-testid="results-count"], .results-count, .total-results'
    );
    if (resultsCountElements.length > 0) {
      this.transformResultsCount(resultsCountElements[0]);
    }

    // Try to find the filters section and transform it
    const filtersElements = document.querySelectorAll(
      '[data-testid="filters-section"], .filters-section, .search-options'
    );
    if (filtersElements.length > 0) {
      this.transformFiltersSection(filtersElements[0]);
    }
  }

  /**
   * Setup mutation observers to watch for dynamic changes
   */
  setupObservers() {
    // Main observer for the load board table
    const tableObserver = new MutationObserver((mutations) => {
      // Look for added nodes that could be the load board
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Check each added node
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // If this is a table or contains a table, transform it
              const tables = node.querySelectorAll("table");
              if (tables.length > 0 || node.tagName === "TABLE") {
                this.transformExistingElements();
              }

              // Check if this is an expanded view
              if (
                node.getAttribute("data-testid") === "load-details-panel" ||
                node.classList.contains("load-details-panel") ||
                node.classList.contains("expanded-view")
              ) {
                this.transformExpandedView(node);
              }
            }
          }
        }
      }
    });

    // Start observing the entire document
    tableObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    // Add to our observers list so we can disconnect if needed
    this.observers.push(tableObserver);
  }

  /**
   * Transform the entire load board table
   * @param {Element} tableElement - The load board table element
   */
  transformLoadBoardTable(tableElement) {
    // Add our legacy class
    tableElement.classList.add("legacy-table");

    // Get all headers and transform them
    const headers = tableElement.querySelectorAll('th, [role="columnheader"]');
    headers.forEach((header) => this.transformHeaderCell(header));

    // Get all rows and transform them
    const rows = tableElement.querySelectorAll("tr");
    rows.forEach((row) => this.transformRow(row));

    // Style the table container
    const container = tableElement.closest(
      '[data-testid="load-board-container"], .load-board-container, .loads-results-container'
    );
    if (container) {
      container.classList.add("legacy-container");
    }
  }

  /**
   * Transform a table header cell
   * @param {Element} headerCell - The header cell element
   */
  transformHeaderCell(headerCell) {
    headerCell.classList.add("legacy-header");

    // Determine which column this is
    const headerText = headerCell.textContent.trim().toLowerCase();
    let columnType = null;

    // Match the header text to our column types
    for (const [key, value] of Object.entries(this.columnMappings)) {
      if (headerText.includes(key.toLowerCase())) {
        columnType = key;
        break;
      }
    }

    // Apply styling based on column type
    if (columnType && this.columnMappings[columnType]) {
      const mapping = this.columnMappings[columnType];

      // Set width
      if (mapping.width) {
        headerCell.style.width = mapping.width;
      }

      // Set text alignment
      if (mapping.align) {
        headerCell.style.textAlign = mapping.align;
      }

      // Store column type for later reference
      headerCell.dataset.columnType = columnType;
    }
  }

  /**
   * Transform a table row
   * @param {Element} row - The row element
   */
  transformRow(row) {
    // Skip if this is a header row
    if (row.querySelector('th, [role="columnheader"]')) {
      return;
    }

    // Add our legacy class
    row.classList.add("legacy-row");

    // Get all cells and transform them
    const cells = row.querySelectorAll('td, [role="cell"]');
    cells.forEach((cell, index) => {
      // Try to determine column type from the header
      let columnType = null;
      const headers = row
        .closest("table")
        .querySelectorAll('th, [role="columnheader"]');
      if (headers.length > index) {
        columnType = headers[index].dataset.columnType;
      }

      this.transformCell(cell, columnType);
    });
  }

  /**
   * Transform a table cell
   * @param {Element} cell - The cell element
   * @param {string} columnType - The type of column this cell is in
   */
  transformCell(cell, columnType) {
    cell.classList.add("legacy-cell");

    // Apply column-specific styling
    if (columnType && this.columnMappings[columnType]) {
      const mapping = this.columnMappings[columnType];

      // Set width
      if (mapping.width) {
        cell.style.width = mapping.width;
      }

      // Set text alignment
      if (mapping.align) {
        cell.style.textAlign = mapping.align;
      }

      // Apply custom transformation if defined
      if (mapping.transform && typeof mapping.transform === "function") {
        mapping.transform(cell);
      }

      // Store column type for later reference
      cell.dataset.columnType = columnType;
    }
  }

  /**
   * Custom transform for Age cells to show HH:MM format
   * @param {Element} cell - The age cell element
   */
  transformAgeCell(cell) {
    // Check if this cell contains a relative time (e.g. "4h", "13h")
    const text = cell.textContent.trim();
    if (/^\d+[hmd]$/i.test(text)) {
      // Convert relative time to HH:MM format
      const timeString = window.DataFormatter.relativeToTime(text);

      // Create a wrapper to maintain original data
      const wrapper = document.createElement("div");
      wrapper.className = "legacy-age-wrapper";
      wrapper.dataset.originalAge = text;
      wrapper.textContent = timeString;

      // Clear cell and add our wrapper
      cell.textContent = "";
      cell.appendChild(wrapper);
    }
  }

  /**
   * Custom transform for Pickup cells to show MM/DD format
   * @param {Element} cell - The pickup cell element
   */
  transformPickupCell(cell) {
    // Check if this cell contains a date
    const text = cell.textContent.trim();
    if (/^\d{1,2}\/\d{1,2}$/.test(text)) {
      // Already in MM/DD format, no change needed
      return;
    }

    // Try to find a date in the cell
    const dateMatch =
      text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/) ||
      text.match(/\d{1,2}-\d{1,2}-\d{2,4}/);
    if (dateMatch) {
      // Extract and format the date
      const date = new Date(dateMatch[0]);
      const formattedDate = window.DataFormatter.formatDate(date);

      // Create a wrapper to maintain original data
      const wrapper = document.createElement("div");
      wrapper.className = "legacy-pickup-wrapper";
      wrapper.dataset.originalPickup = text;
      wrapper.textContent = formattedDate;

      // Clear cell and add our wrapper
      cell.textContent = "";
      cell.appendChild(wrapper);
    }
  }

  /**
   * Custom transform for Trip cells to show as blue links
   * @param {Element} cell - The trip cell element
   */
  transformTripCell(cell) {
    // Check if this cell contains a trip number
    const text = cell.textContent.trim();
    if (/^\d+$/.test(text) || /^\d+ mi$/.test(text)) {
      // Extract the numeric part
      const tripNumber = text.replace(/[^\d]/g, "");

      // Create a wrapper with link styling
      const wrapper = document.createElement("a");
      wrapper.className = "legacy-trip-wrapper";
      wrapper.href = "#";
      wrapper.dataset.originalTrip = text;
      wrapper.textContent = tripNumber;
      wrapper.style.color = "#0000ff";
      wrapper.style.textDecoration = "none";

      // Add click handler to prevent default navigation
      wrapper.addEventListener("click", (e) => {
        e.preventDefault();
        // The original link might have special behavior, try to trigger it
        const originalLink = cell.querySelector("a");
        if (originalLink) {
          originalLink.click();
        }
      });

      // Clear cell and add our wrapper
      cell.textContent = "";
      cell.appendChild(wrapper);
    }
  }

  /**
   * Custom transform for Rate cells to format properly
   * @param {Element} cell - The rate cell element
   */
  transformRateCell(cell) {
    // Check if this cell contains a dollar amount
    const text = cell.textContent.trim();
    const rateMatch = text.match(/\$?(\d+,?)+(\.\d+)?/);
    if (rateMatch) {
      // Extract and format the rate
      const rate = rateMatch[0].replace(/[$,]/g, "");
      const formattedRate = window.DataFormatter.formatDollarAmount(rate);

      // Create a wrapper to maintain original data
      const wrapper = document.createElement("div");
      wrapper.className = "legacy-rate-wrapper";
      wrapper.dataset.originalRate = text;
      wrapper.textContent = formattedRate;
      wrapper.style.color = "#006600"; // Green color for money

      // Clear cell and add our wrapper
      cell.textContent = "";
      cell.appendChild(wrapper);

      // Hide any rate per mile details
      const perMileElements = cell.querySelectorAll(
        '.rate-per-mile, [data-testid="rate-per-mile"]'
      );
      perMileElements.forEach((el) => (el.style.display = "none"));
    }
  }

  /**
   * Custom transform for Weight cells to show proper format
   * @param {Element} cell - The weight cell element
   */
  transformWeightCell(cell) {
    // Check if this cell contains a weight
    const text = cell.textContent.trim();
    const weightMatch = text.match(/(\d+,?)+(\.\d+)?/);
    if (weightMatch) {
      // Extract and format the weight
      const weight = weightMatch[0].replace(/,/g, "");
      const formattedWeight = window.DataFormatter.formatWeight(weight);

      // Create a wrapper to maintain original data
      const wrapper = document.createElement("div");
      wrapper.className = "legacy-weight-wrapper";
      wrapper.dataset.originalWeight = text;
      wrapper.textContent = formattedWeight;

      // Clear cell and add our wrapper
      cell.textContent = "";
      cell.appendChild(wrapper);
    }
  }

  /**
   * Transform the results count section
   * @param {Element} resultsElement - The results count element
   */
  transformResultsCount(resultsElement) {
    resultsElement.classList.add("legacy-results-count");

    // Try to extract the count from the text
    const text = resultsElement.textContent.trim();
    const countMatch = text.match(/(\d+)/);
    if (countMatch) {
      const count = countMatch[1];

      // Format to match old UI: "293 TOTAL RESULTS"
      resultsElement.textContent = `${count} TOTAL RESULTS`;
    }
  }

  /**
   * Transform the filters section
   * @param {Element} filtersElement - The filters section element
   */
  transformFiltersSection(filtersElement) {
    filtersElement.classList.add("legacy-filters");

    // Simplify filter elements
    const inputs = filtersElement.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.classList.add("legacy-input");
      input.style.height = "22px";
      input.style.fontSize = "12px";
    });

    const buttons = filtersElement.querySelectorAll("button");
    buttons.forEach((button) => {
      button.classList.add("legacy-button");
      button.style.height = "22px";
      button.style.fontSize = "12px";
    });
  }

  /**
   * Transform the expanded view (load details panel)
   * @param {Element} expandedView - The expanded view element
   */
  transformExpandedView(expandedView) {
    expandedView.classList.add("legacy-expanded-view");

    // Make it more compact
    expandedView.style.padding = "8px";
    expandedView.style.margin = "0";
    expandedView.style.fontSize = "12px";
    expandedView.style.backgroundColor = "#f9f9f9";
    expandedView.style.border = "1px solid #ccc";
    expandedView.style.borderRadius = "0";

    // Simplify buttons in expanded view
    const buttons = expandedView.querySelectorAll("button");
    buttons.forEach((button) => {
      button.classList.add("legacy-button");
      button.style.height = "22px";
      button.style.fontSize = "12px";
    });
  }

  /**
   * Setup handler for expanded view transformation
   */
  setupExpandedViewHandler() {
    // Watch for clicks on rows that might expand details
    document.addEventListener("click", (e) => {
      // Small delay to let the expanded view render
      setTimeout(() => {
        const expandedViews = document.querySelectorAll(
          '[data-testid="load-details-panel"], .load-details-panel, .expanded-view'
        );
        expandedViews.forEach((view) => {
          if (!view.classList.contains("legacy-expanded-view")) {
            this.transformExpandedView(view);
          }
        });
      }, 100);
    });
  }

  /**
   * Setup custom refresh button
   */
  setupRefreshButton() {
    // Find the age column header
    const ageHeaders = window.DOMFinder.findTableHeader("Age");
    if (ageHeaders.length > 0) {
      const ageHeader = ageHeaders[0];

      // Check if we already added a refresh button
      if (!ageHeader.querySelector(".legacy-refresh-button")) {
        // Create our custom refresh button
        const refreshButton = document.createElement("button");
        refreshButton.className = "legacy-refresh-button";
        refreshButton.textContent = "↻";
        refreshButton.title = "Refresh Loads";

        // Add click handler
        refreshButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Look for the original refresh button
          const originalRefreshButton = document.querySelector(
            '[data-testid="refresh-button"], .refresh-button'
          );
          if (originalRefreshButton) {
            originalRefreshButton.click();
          } else {
            // If no refresh button, try clicking the age header to resort
            ageHeader.click();
          }
        });

        // Add to the header
        ageHeader.appendChild(refreshButton);
      }
    }
  }

  /**
   * Hide elements from the new UI that don't exist in the old UI
   */
  hideNewUIElements() {
    // Examples of elements to hide - update based on actual page structure
    const elementsToHide = [
      '[data-testid="new-feature-badge"]',
      ".new-feature-badge",
      ".feature-announcement",
      ".tour-guide",
      ".whats-new-banner",
      ".welcome-message",
    ];

    elementsToHide.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        element.style.display = "none";
      });
    });
  }

  /**
   * Clean up by disconnecting all observers
   */
  cleanup() {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers = [];
  }
}

// Initialize the transformer
const transformer = new LoadBoardTransformer();
transformer.init();

// Expose for access from other scripts
window.loadBoardTransformer = transformer;
