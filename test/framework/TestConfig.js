/**
 * Test Configuration Manager
 * Centralizes configuration settings for the test framework
 */
class TestConfig {
  constructor() {
    this.config = {
      // Base configuration
      baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
      testMode: process.env.TEST_MODE || 'browser', // 'browser', 'mock', 'api'
      
      // Browser settings
      browser: {
        headless: process.env.HEADLESS !== 'false',
        slowMo: parseInt(process.env.SLOW_MO || '0', 10),
        defaultViewport: {
          width: parseInt(process.env.VIEWPORT_WIDTH || '1280', 10),
          height: parseInt(process.env.VIEWPORT_HEIGHT || '800', 10)
        },
        defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000', 10)
      },
      
      // Test data settings
      testData: {
        directory: process.env.TEST_DATA_DIR || './test/data',
        useFixtures: process.env.USE_FIXTURES !== 'false'
      },
      
      // Reporting settings
      reporting: {
        screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE !== 'false',
        screenshotDirectory: process.env.SCREENSHOT_DIR || './test/reports/screenshots',
        performanceReporting: process.env.PERFORMANCE_REPORTING !== 'false',
        performanceThresholds: {
          pageLoad: parseInt(process.env.PERF_THRESHOLD_PAGE_LOAD || '3000', 10),
          apiResponse: parseInt(process.env.PERF_THRESHOLD_API || '500', 10)
        }
      },
      
      // API testing settings
      api: {
        baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
        timeout: parseInt(process.env.API_TIMEOUT || '5000', 10)
      },
      
      // Retry settings
      retry: {
        count: parseInt(process.env.RETRY_COUNT || '2', 10),
        enabled: process.env.RETRY_ENABLED !== 'false'
      }
    };
  }

  /**
   * Get the complete configuration object
   * @returns {Object} The configuration object
   */
  getConfig() {
    return this.config;
  }

  /**
   * Get a specific configuration value by path
   * @param {string} path - Dot notation path to the configuration value
   * @returns {any} The configuration value
   */
  get(path) {
    return path.split('.').reduce((obj, key) => obj && obj[key], this.config);
  }

  /**
   * Set a specific configuration value by path
   * @param {string} path - Dot notation path to the configuration value
   * @param {any} value - The value to set
   */
  set(path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    const obj = parts.reduce((obj, key) => obj[key] = obj[key] || {}, this.config);
    obj[last] = value;
  }
}

module.exports = new TestConfig();
