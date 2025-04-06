// dom-utils.js - Helper functions for DOM manipulation

/**
 * Helper to find elements in the page based on content, attributes, or element types
 * Useful for finding dynamic elements in SPAs
 */
class DOMFinder {
  /**
   * Find elements by their text content (exact or partial match)
   * @param {string} text - Text to search for
   * @param {boolean} exactMatch - Whether to require exact text match
   * @param {string} elementType - Optional element type to restrict search to
   * @returns {Array} - Array of matching elements
   */
  static findByText(text, exactMatch = false, elementType = "*") {
    const elements = document.querySelectorAll(elementType);
    return Array.from(elements).filter((element) => {
      const content = element.textContent.trim();
      return exactMatch ? content === text : content.includes(text);
    });
  }

  /**
   * Find table headers by their text content
   * @param {string} text - Header text to search for
   * @returns {Array} - Array of matching header elements
   */
  static findTableHeader(text) {
    const headers = document.querySelectorAll('th, [role="columnheader"]');
    return Array.from(headers).filter((header) => {
      return header.textContent.trim().includes(text);
    });
  }

  /**
   * Find elements by data attribute
   * @param {string} attribute - Data attribute name without 'data-' prefix
   * @param {string} value - Value to match
   * @returns {Array} - Array of matching elements
   */
  static findByDataAttribute(attribute, value) {
    return Array.from(
      document.querySelectorAll(`[data-${attribute}="${value}"]`)
    );
  }

  /**
   * Find the load board table element
   * @returns {Element|null} - The load board table or null if not found
   */
  static findLoadBoardTable() {
    // Try various selectors that might identify the load board table
    const selectors = [
      "table.loads-table",
      "table.search-results",
      '[data-testid="load-board-container"] table',
      ".load-board table",
      'table:has(th:contains("Origin"))',
    ];

    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) return element;
      } catch (e) {
        // Some complex selectors might not be supported in all browsers
        console.log("Selector not supported:", selector);
      }
    }

    // If no table found by selectors, try to find by column headers
    const commonHeaders = ["Origin", "Destination", "Age", "Rate"];
    for (const header of commonHeaders) {
      const headers = this.findTableHeader(header);
      if (headers.length > 0) {
        const table = headers[0].closest("table");
        if (table) return table;
      }
    }

    return null;
  }

  /**
   * Find all elements that match the given filter function
   * @param {Function} filterFn - Function that takes an element and returns boolean
   * @returns {Array} - Array of matching elements
   */
  static findAll(filterFn) {
    const allElements = document.querySelectorAll("*");
    return Array.from(allElements).filter(filterFn);
  }
}

/**
 * Helper for creating and manipulating DOM elements
 */
class DOMBuilder {
  /**
   * Create a new element with attributes and content
   * @param {string} tag - The HTML tag name
   * @param {Object} attributes - Object with attributes to set
   * @param {string|Element|Array} content - Content to append to the element
   * @returns {Element} - The created element
   */
  static createElement(tag, attributes = {}, content = null) {
    const element = document.createElement(tag);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "style" && typeof value === "object") {
        Object.entries(value).forEach(([prop, val]) => {
          element.style[prop] = val;
        });
      } else if (key === "className") {
        element.className = value;
      } else if (key === "dataset") {
        Object.entries(value).forEach(([dataKey, dataVal]) => {
          element.dataset[dataKey] = dataVal;
        });
      } else {
        element.setAttribute(key, value);
      }
    });

    // Add content
    if (content) {
      if (typeof content === "string") {
        element.textContent = content;
      } else if (content instanceof Element) {
        element.appendChild(content);
      } else if (Array.isArray(content)) {
        content.forEach((item) => {
          if (typeof item === "string") {
            element.appendChild(document.createTextNode(item));
          } else if (item instanceof Element) {
            element.appendChild(item);
          }
        });
      }
    }

    return element;
  }

  /**
   * Create a table row with cells
   * @param {Array} cellsData - Array of cell data (text or elements)
   * @param {string} cellType - Type of cells to create ('td' or 'th')
   * @returns {Element} - The created row element
   */
  static createTableRow(cellsData, cellType = "td") {
    const row = document.createElement("tr");
    row.className = "legacy-row";

    cellsData.forEach((data) => {
      let cell;
      if (typeof data === "object" && data !== null && data.element) {
        // If data contains an element property, use it
        cell = data.element;
      } else {
        // Otherwise create a new cell
        cell = document.createElement(cellType);
        cell.className = "legacy-cell";

        if (typeof data === "string" || typeof data === "number") {
          cell.textContent = data;
        } else if (data instanceof Element) {
          cell.appendChild(data);
        } else if (typeof data === "object" && data !== null) {
          // Handle cell configuration object
          if (data.content !== undefined) {
            if (typeof data.content === "string") {
              cell.textContent = data.content;
            } else if (data.content instanceof Element) {
              cell.appendChild(data.content);
            }
          }

          if (data.className) {
            cell.className = `legacy-cell ${data.className}`;
          }

          if (data.style) {
            Object.entries(data.style).forEach(([prop, val]) => {
              cell.style[prop] = val;
            });
          }

          if (data.attributes) {
            Object.entries(data.attributes).forEach(([key, val]) => {
              cell.setAttribute(key, val);
            });
          }
        }
      }

      row.appendChild(cell);
    });

    return row;
  }
}

/**
 * Helper for formatting values to match old DAT Power style
 */
class DataFormatter {
  /**
   * Format a date to match the old DAT Power format (MM/DD)
   * @param {Date|string} date - Date to format
   * @returns {string} - Formatted date
   */
  static formatDate(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${month}/${day}`;
  }

  /**
   * Format a time to match the old DAT Power format (HH:MM)
   * @param {Date|string} date - Date to format
   * @returns {string} - Formatted time
   */
  static formatTime(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  }

  /**
   * Convert a relative time string (e.g. "4h", "13h") to the old time format
   * @param {string} relativeTime - Relative time string
   * @returns {string} - Formatted time
   */
  static relativeToTime(relativeTime) {
    // This is an approximation as we can't know the exact time without context
    if (!relativeTime) return "00:00";

    const now = new Date();
    let timeValue = parseInt(relativeTime, 10) || 0;
    let unit = relativeTime.replace(/[0-9]/g, "").trim();

    let convertedDate = new Date(now);

    if (unit.includes("h")) {
      convertedDate.setHours(now.getHours() - timeValue);
    } else if (unit.includes("m")) {
      convertedDate.setMinutes(now.getMinutes() - timeValue);
    } else if (unit.includes("d")) {
      convertedDate.setDate(now.getDate() - timeValue);
    }

    return this.formatTime(convertedDate);
  }

  /**
   * Format a dollar amount to match the old DAT Power format
   * @param {number|string} amount - Amount to format
   * @returns {string} - Formatted amount
   */
  static formatDollarAmount(amount) {
    if (typeof amount === "string") {
      // Remove any existing formatting
      amount = amount.replace(/[$,]/g, "");
      amount = parseFloat(amount);
    }

    if (isNaN(amount)) return "-";

    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }

  /**
   * Format a weight value to match the old DAT Power format
   * @param {number|string} weight - Weight to format
   * @returns {string} - Formatted weight
   */
  static formatWeight(weight) {
    if (typeof weight === "string") {
      // Extract numeric part
      weight = weight.replace(/[^0-9.]/g, "");
      weight = parseFloat(weight);
    }

    if (isNaN(weight)) return "-";

    return `${weight.toLocaleString()} lbs`;
  }
}

// Export functionality for use in other scripts
window.DOMFinder = DOMFinder;
window.DOMBuilder = DOMBuilder;
window.DataFormatter = DataFormatter;
