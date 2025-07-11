const NodeEnvironment = require('jest-environment-node').default;
const fs = require('fs');
const path = require('path');

/**
 * Custom test environment extending the Node environment
 * Adds functionality for screenshots on failure and custom global helpers
 */
class CustomEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
    this.testInfo = {};
  }

  async setup() {
    await super.setup();
    
    // Add custom methods to the global scope
    this.global.takeScreenshot = async (name) => {
      const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
      
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      const screenshotPath = path.join(screenshotDir, `${name}-${Date.now()}.png`);
      await this.global.page.screenshot({ path: screenshotPath, fullPage: true });
      return screenshotPath;
    };

    // Add helper for local storage access
    this.global.getLocalStorage = async (key) => {
      return this.global.page.evaluate((k) => {
        return localStorage.getItem(k);
      }, key);
    };

    this.global.setLocalStorage = async (key, value) => {
      return this.global.page.evaluate((k, v) => {
        localStorage.setItem(k, v);
        return true;
      }, key, value);
    };

    // Add helper for waiting with timeout and custom error message
    this.global.waitForWithTimeout = async (selector, options = {}, timeoutMsg = null) => {
      try {
        await this.global.page.waitForSelector(selector, options);
      } catch (error) {
        if (timeoutMsg) {
          throw new Error(`${timeoutMsg}: ${error.message}`);
        }
        throw error;
      }
    };
  }

  async teardown() {
    await super.teardown();
  }

  async handleTestEvent(event, state) {
    if (event.name === 'test_start') {
      this.testInfo.name = event.test.name;
    }
    
    // Take screenshot on test failure
    if (event.name === 'test_done' && event.test.errors.length > 0) {
      const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
      
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      const testName = event.test.name.replace(/[^\w]/g, '-').toLowerCase();
      const screenshotPath = path.join(screenshotDir, `failure-${testName}-${Date.now()}.png`);
      
      try {
        await this.global.page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Screenshot saved to: ${screenshotPath}`);
      } catch (error) {
        console.error('Failed to take screenshot:', error);
      }
    }
  }
}

module.exports = CustomEnvironment;
