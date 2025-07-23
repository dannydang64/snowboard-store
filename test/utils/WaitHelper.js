/**
 * Wait Helper
 * Provides advanced wait mechanisms to avoid fixed timeouts
 * Implements best practices for waiting in tests
 */
const TestConfig = require('../framework/TestConfig');

class WaitHelper {
  constructor() {
    this.defaultTimeout = TestConfig.get('browser.defaultTimeout');
  }

  /**
   * Wait for an element to be visible
   * @param {string} selector - CSS selector for the element
   * @param {Object} options - Wait options
   * @returns {Promise<ElementHandle>} The element handle
   */
  async waitForElement(selector, options = {}) {
    const timeout = options.timeout || this.defaultTimeout;
    try {
      return await page.waitForSelector(selector, { 
        visible: true, 
        timeout 
      });
    } catch (error) {
      throw new Error(`Element ${selector} not visible after ${timeout}ms: ${error.message}`);
    }
  }

  /**
   * Wait for an element to be hidden
   * @param {string} selector - CSS selector for the element
   * @param {Object} options - Wait options
   */
  async waitForElementToBeHidden(selector, options = {}) {
    const timeout = options.timeout || this.defaultTimeout;
    try {
      await page.waitForSelector(selector, { 
        hidden: true, 
        timeout 
      });
    } catch (error) {
      throw new Error(`Element ${selector} still visible after ${timeout}ms: ${error.message}`);
    }
  }

  /**
   * Wait for navigation to complete
   * @param {Object} options - Navigation options
   */
  async waitForNavigation(options = {}) {
    const waitUntil = options.waitUntil || 'networkidle0';
    const timeout = options.timeout || this.defaultTimeout;
    
    try {
      await page.waitForNavigation({ 
        waitUntil,
        timeout
      });
    } catch (error) {
      throw new Error(`Navigation not completed after ${timeout}ms: ${error.message}`);
    }
  }

  /**
   * Wait for a network request to complete
   * @param {string} urlPattern - URL pattern to match
   * @param {Object} options - Wait options
   * @returns {Promise<Response>} The response object
   */
  async waitForRequest(urlPattern, options = {}) {
    const timeout = options.timeout || this.defaultTimeout;
    
    try {
      return await page.waitForRequest(
        (request) => request.url().match(urlPattern),
        { timeout }
      );
    } catch (error) {
      throw new Error(`Request matching ${urlPattern} not detected after ${timeout}ms: ${error.message}`);
    }
  }

  /**
   * Wait for a network response to complete
   * @param {string} urlPattern - URL pattern to match
   * @param {Object} options - Wait options
   * @returns {Promise<Response>} The response object
   */
  async waitForResponse(urlPattern, options = {}) {
    const timeout = options.timeout || this.defaultTimeout;
    
    try {
      return await page.waitForResponse(
        (response) => response.url().match(urlPattern),
        { timeout }
      );
    } catch (error) {
      throw new Error(`Response matching ${urlPattern} not received after ${timeout}ms: ${error.message}`);
    }
  }

  /**
   * Wait for a function to evaluate to truthy
   * @param {Function} fn - Function to evaluate
   * @param {Object} options - Wait options
   * @returns {Promise<any>} The result of the function
   */
  async waitForFunction(fn, options = {}) {
    const timeout = options.timeout || this.defaultTimeout;
    const polling = options.polling || 'mutation';
    
    try {
      return await page.waitForFunction(fn, { 
        timeout,
        polling
      });
    } catch (error) {
      throw new Error(`Function condition not met after ${timeout}ms: ${error.message}`);
    }
  }

  /**
   * Wait for a specific condition to be true with custom polling
   * @param {Function} conditionFn - Function that returns a boolean
   * @param {Object} options - Wait options
   */
  async waitForCondition(conditionFn, options = {}) {
    const timeout = options.timeout || this.defaultTimeout;
    const pollInterval = options.pollInterval || 100;
    const errorMessage = options.errorMessage || 'Condition not met';
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await conditionFn()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error(`${errorMessage} after ${timeout}ms`);
  }

  /**
   * Wait for an element to have specific text
   * @param {string} selector - CSS selector for the element
   * @param {string} text - Text to wait for
   * @param {Object} options - Wait options
   */
  async waitForElementText(selector, text, options = {}) {
    const timeout = options.timeout || this.defaultTimeout;
    const exact = options.exact || false;
    
    await this.waitForCondition(
      async () => {
        try {
          const elementText = await page.$eval(selector, el => el.textContent.trim());
          return exact ? elementText === text : elementText.includes(text);
        } catch (error) {
          return false;
        }
      },
      {
        timeout,
        errorMessage: `Element ${selector} did not contain text "${text}" after ${timeout}ms`
      }
    );
  }

  /**
   * Wait for multiple elements to be present
   * @param {string} selector - CSS selector for the elements
   * @param {number} count - Expected number of elements
   * @param {Object} options - Wait options
   * @returns {Promise<Array<ElementHandle>>} Array of element handles
   */
  async waitForElements(selector, count = 1, options = {}) {
    const timeout = options.timeout || this.defaultTimeout;
    const comparison = options.comparison || 'atleast';
    
    await this.waitForCondition(
      async () => {
        const elements = await page.$$(selector);
        switch (comparison) {
          case 'exactly':
            return elements.length === count;
          case 'atleast':
            return elements.length >= count;
          case 'atmost':
            return elements.length <= count;
          default:
            return elements.length >= count;
        }
      },
      {
        timeout,
        errorMessage: `Expected ${comparison} ${count} elements matching ${selector}, but found different count after ${timeout}ms`
      }
    );
    
    return page.$$(selector);
  }

  /**
   * Wait for localStorage to contain a specific key
   * @param {string} key - The localStorage key
   * @param {Object} options - Wait options
   * @returns {Promise<string>} The localStorage value
   */
  async waitForLocalStorage(key, options = {}) {
    const timeout = options.timeout || this.defaultTimeout;
    
    return this.waitForCondition(
      async () => {
        const value = await page.evaluate((k) => localStorage.getItem(k), key);
        return value !== null;
      },
      {
        timeout,
        errorMessage: `localStorage key "${key}" not found after ${timeout}ms`
      }
    ).then(async () => {
      return page.evaluate((k) => localStorage.getItem(k), key);
    });
  }
}

module.exports = new WaitHelper();
