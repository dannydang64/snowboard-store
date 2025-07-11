/**
 * Global setup for all tests
 * Extends Jest with custom matchers and sets up global configuration
 */
const puppeteer = require('puppeteer');
const config = require('../config');
const mockDataStore = require('../utils/MockDataStore');

// Set default timeout for all tests
jest.setTimeout(30000);

// Initialize global browser and page variables
global.browser = null;
global.page = null;

// Setup puppeteer before tests
beforeAll(async () => {
  // Make config and mockDataStore available globally
  global.testConfig = config;
  global.mockDataStore = mockDataStore;
  
  // Only launch browser if we're not in mock mode
  if (config.testMode !== 'mock') {
    // Launch browser
    global.browser = await puppeteer.launch(config.browser);
    
    // Create a new page
    global.page = await global.browser.newPage();
  } else {
    console.log('Running in mock mode - no browser will be launched');
    
    // Create mock page object
    global.page = {
      url: () => mockDataStore.getCurrentUrl(),
      goto: async (url) => {
        mockDataStore.setCurrentUrl(url);
        return Promise.resolve();
      },
      waitForSelector: async () => Promise.resolve(),
      waitForNavigation: async () => Promise.resolve(),
      click: async () => Promise.resolve(),
      type: async () => Promise.resolve(),
      select: async () => Promise.resolve(),
      $: async (selector) => {
        // For specific selectors, return a mock element
        if (selector.includes('Continue Shopping')) {
          return { click: async () => Promise.resolve() };
        }
        return null;
      },
      $$: async () => [],
      $eval: async () => null,
      $$eval: async () => [],
      evaluate: async () => null,
      screenshot: async () => null,
      setViewport: async () => Promise.resolve(),
      setUserAgent: async () => Promise.resolve(),
      setRequestInterception: async () => Promise.resolve(),
      on: () => null,
      reload: async () => Promise.resolve()
    };
    
    // Create mock browser object
    global.browser = {
      newPage: async () => global.page,
      close: async () => Promise.resolve()
    };
  }
  
  // Page is already created above
});

// Cleanup after tests
afterAll(async () => {
  if (global.browser) {
    await global.browser.close();
  }
});

// Custom matchers for better assertions
expect.extend({
  toBeVisible: async function(received) {
    try {
      const isVisible = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (!element) return false;
        
        const style = window.getComputedStyle(element);
        return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }, received);
      
      return {
        message: () => `expected ${received} ${isVisible ? 'not ' : ''}to be visible`,
        pass: isVisible
      };
    } catch (error) {
      return {
        message: () => `Error checking visibility: ${error.message}`,
        pass: false
      };
    }
  },
  
  toHaveCount: async function(received, count) {
    try {
      const actualCount = await page.$$eval(received, elements => elements.length);
      const pass = actualCount === count;
      
      return {
        message: () => `expected ${received} to have count ${count}, but found ${actualCount}`,
        pass
      };
    } catch (error) {
      return {
        message: () => `Error counting elements: ${error.message}`,
        pass: false
      };
    }
  },
  
  toHaveText: async function(received, expected) {
    try {
      const text = await page.$eval(received, el => el.textContent.trim());
      const pass = text.includes(expected);
      
      return {
        message: () => `expected ${received} to have text "${expected}", but found "${text}"`,
        pass
      };
    } catch (error) {
      return {
        message: () => `Error getting text: ${error.message}`,
        pass: false
      };
    }
  },
  
  toHaveValue: async function(received, expected) {
    try {
      const value = await page.$eval(received, el => el.value);
      const pass = value === expected;
      
      return {
        message: () => `expected ${received} to have value "${expected}", but found "${value}"`,
        pass
      };
    } catch (error) {
      return {
        message: () => `Error getting value: ${error.message}`,
        pass: false
      };
    }
  }
});

// Global beforeAll hook
beforeAll(async () => {
  // Set viewport size
  await page.setViewport({ width: 1280, height: 720 });
  
  // Set user agent to avoid bot detection
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36');
  
  // Enable request interception for performance monitoring
  await page.setRequestInterception(true);
  
  page.on('request', request => {
    request.continue();
  });
  
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    
    // Log API calls for debugging
    if (url.includes('/api/') && status !== 200) {
      console.log(`API Response [${status}]: ${url}`);
    }
  });
  
  // Log console messages from the browser
  page.on('console', message => {
    if (message.type() === 'error') {
      console.log(`Browser console error: ${message.text()}`);
    }
  });
});

// Global afterAll hook
afterAll(async () => {
  // Clean up any test data or state
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch (error) {
    console.error('Error cleaning up browser state:', error);
  }
});
