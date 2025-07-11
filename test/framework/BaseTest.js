/**
 * Base Test class that provides common functionality for all test suites
 * Implements Page Object Model pattern and provides helper methods
 */
class BaseTest {
  constructor() {
    this.baseUrl = global.testConfig.baseUrl;
    this.testMode = global.testConfig.testMode;
    this.pages = {};
    
    // Use the global mock data store
    this.mockData = global.mockDataStore;
  }

  /**
   * Navigate to a specific URL path
   * @param {string} path - The path to navigate to (without base URL)
   */
  async navigateTo(path) {
    const url = `${this.baseUrl}${path}`;
    await page.goto(url, { waitUntil: 'networkidle0' });
  }

  /**
   * Wait for navigation to complete
   * @param {Object} options - Navigation options
   */
  async waitForNavigation(options = { waitUntil: 'networkidle0' }) {
    await page.waitForNavigation(options);
  }

  /**
   * Get the current URL path
   * @returns {string} The current URL path
   */
  async getCurrentPath() {
    return page.evaluate(() => window.location.pathname);
  }

  /**
   * Check if an element exists on the page
   * @param {string} selector - CSS selector for the element
   * @returns {boolean} True if the element exists, false otherwise
   */
  async elementExists(selector) {
    const element = await page.$(selector);
    return element !== null;
  }

  /**
   * Wait for an element to be visible
   * @param {string} selector - CSS selector for the element
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElement(selector, timeout = 5000) {
    await page.waitForSelector(selector, { 
      visible: true, 
      timeout 
    });
  }

  /**
   * Click an element
   * @param {string} selector - CSS selector for the element
   */
  async clickElement(selector) {
    await this.waitForElement(selector);
    await page.click(selector);
  }

  /**
   * Type text into an input field
   * @param {string} selector - CSS selector for the input field
   * @param {string} text - Text to type
   */
  async typeText(selector, text) {
    await this.waitForElement(selector);
    await page.type(selector, text);
  }

  /**
   * Get text content of an element
   * @param {string} selector - CSS selector for the element
   * @returns {string} Text content of the element
   */
  async getElementText(selector) {
    await this.waitForElement(selector);
    return page.$eval(selector, el => el.textContent.trim());
  }

  /**
   * Get value of an input field
   * @param {string} selector - CSS selector for the input field
   * @returns {string} Value of the input field
   */
  async getInputValue(selector) {
    await this.waitForElement(selector);
    return page.$eval(selector, el => el.value);
  }

  /**
   * Select an option from a dropdown
   * @param {string} selector - CSS selector for the select element
   * @param {string} value - Value to select
   */
  async selectOption(selector, value) {
    await this.waitForElement(selector);
    await page.select(selector, value);
  }

  /**
   * Wait for a specific condition to be true
   * @param {Function} conditionFn - Function that returns a boolean
   * @param {number} timeout - Timeout in milliseconds
   * @param {string} errorMessage - Error message if timeout occurs
   */
  async waitForCondition(conditionFn, timeout = 5000, errorMessage = 'Condition not met') {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await conditionFn()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(errorMessage);
  }

  /**
   * Get cart data from localStorage or mock cart
   * @returns {Array} Cart items
   */
  async getCartFromLocalStorage() {
    if (this.testMode === 'mock') {
      // Return mock cart items
      return this.mockData.cart.items;
    }
    
    try {
      return await page.evaluate(() => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
      });
    } catch (error) {
      console.log('Error getting cart from localStorage:', error.message);
      return [];
    }
  }

  /**
   * Clear the cart in localStorage or mock cart
   */
  async clearCart() {
    if (this.testMode === 'mock') {
      // Clear mock cart
      this.mockData.cart.clear();
      console.log('Cleared mock cart');
      return;
    }
    
    try {
      // Only try to clear localStorage if we're on a page that allows it
      const url = await page.url();
      if (url.startsWith('http')) {
        await page.evaluate(() => {
          try {
            localStorage.setItem('cart', '[]');
            // Dispatch event to notify components about cart update
            window.dispatchEvent(new Event('cartUpdated'));
          } catch (e) {
            console.log('Could not access localStorage, may be running in test context');
          }
        });
      } else {
        console.log('Not on a page that supports localStorage');
      }
    } catch (error) {
      console.log('Error clearing cart:', error.message);
    }
  }

  /**
   * Take a screenshot
   * @param {string} name - Name for the screenshot file
   */
  async takeScreenshot(name) {
    await global.takeScreenshot(name);
  }
}

module.exports = BaseTest;
