/**
 * Performance Helper
 * Provides utilities for measuring and analyzing performance metrics
 */
class PerformanceHelper {
  constructor() {
    this.metrics = {
      pageLoads: {},
      apiCalls: {},
      interactions: {}
    };
    
    this.thresholds = {
      pageLoad: {
        home: 1500,
        product: 1000,
        cart: 800,
        checkout: 1200
      },
      apiResponse: {
        products: 500,
        cart: 300,
        orders: 500
      },
      interaction: {
        addToCart: 300,
        updateQuantity: 200,
        checkout: 1000
      }
    };
  }

  /**
   * Measure page load time
   * @param {string} pageName - Name of the page
   * @param {Function} navigationFn - Function that triggers navigation
   * @returns {Promise<number>} Load time in milliseconds
   */
  async measurePageLoad(pageName, navigationFn) {
    const startTime = Date.now();
    
    // Execute navigation function
    await navigationFn();
    
    // Wait for page to be fully loaded
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // Store metrics
    if (!this.metrics.pageLoads[pageName]) {
      this.metrics.pageLoads[pageName] = [];
    }
    this.metrics.pageLoads[pageName].push(loadTime);
    
    return loadTime;
  }

  /**
   * Measure API response time
   * @param {string} apiName - Name of the API
   * @param {Function} apiFn - Function that makes the API call
   * @returns {Promise<number>} Response time in milliseconds
   */
  async measureApiResponse(apiName, apiFn) {
    const startTime = Date.now();
    
    // Execute API call
    await apiFn();
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Store metrics
    if (!this.metrics.apiCalls[apiName]) {
      this.metrics.apiCalls[apiName] = [];
    }
    this.metrics.apiCalls[apiName].push(responseTime);
    
    return responseTime;
  }

  /**
   * Measure user interaction time
   * @param {string} interactionName - Name of the interaction
   * @param {Function} interactionFn - Function that performs the interaction
   * @returns {Promise<number>} Interaction time in milliseconds
   */
  async measureInteraction(interactionName, interactionFn) {
    const startTime = Date.now();
    
    // Execute interaction
    await interactionFn();
    
    const endTime = Date.now();
    const interactionTime = endTime - startTime;
    
    // Store metrics
    if (!this.metrics.interactions[interactionName]) {
      this.metrics.interactions[interactionName] = [];
    }
    this.metrics.interactions[interactionName].push(interactionTime);
    
    return interactionTime;
  }

  /**
   * Check if a performance metric meets the threshold
   * @param {string} type - Type of metric (pageLoad, apiResponse, interaction)
   * @param {string} name - Name of the page, API, or interaction
   * @param {number} value - Measured value
   * @returns {boolean} True if the metric meets the threshold
   */
  meetsThreshold(type, name, value) {
    if (!this.thresholds[type] || !this.thresholds[type][name]) {
      return true; // No threshold defined
    }
    
    return value <= this.thresholds[type][name];
  }

  /**
   * Get average metric value
   * @param {string} type - Type of metric (pageLoad, apiResponse, interaction)
   * @param {string} name - Name of the page, API, or interaction
   * @returns {number} Average value
   */
  getAverageMetric(type, name) {
    const metrics = this.metrics[type][name];
    
    if (!metrics || metrics.length === 0) {
      return 0;
    }
    
    const sum = metrics.reduce((total, value) => total + value, 0);
    return sum / metrics.length;
  }

  /**
   * Get all performance metrics
   * @returns {Object} All metrics
   */
  getAllMetrics() {
    const result = {
      pageLoads: {},
      apiCalls: {},
      interactions: {}
    };
    
    // Process page load metrics
    for (const [pageName, metrics] of Object.entries(this.metrics.pageLoads)) {
      const avg = this.getAverageMetric('pageLoads', pageName);
      const threshold = this.thresholds.pageLoad[pageName] || 'N/A';
      const meetsThreshold = this.meetsThreshold('pageLoad', pageName, avg);
      
      result.pageLoads[pageName] = {
        average: avg,
        min: Math.min(...metrics),
        max: Math.max(...metrics),
        count: metrics.length,
        threshold,
        meetsThreshold
      };
    }
    
    // Process API call metrics
    for (const [apiName, metrics] of Object.entries(this.metrics.apiCalls)) {
      const avg = this.getAverageMetric('apiCalls', apiName);
      const threshold = this.thresholds.apiResponse[apiName] || 'N/A';
      const meetsThreshold = this.meetsThreshold('apiResponse', apiName, avg);
      
      result.apiCalls[apiName] = {
        average: avg,
        min: Math.min(...metrics),
        max: Math.max(...metrics),
        count: metrics.length,
        threshold,
        meetsThreshold
      };
    }
    
    // Process interaction metrics
    for (const [interactionName, metrics] of Object.entries(this.metrics.interactions)) {
      const avg = this.getAverageMetric('interactions', interactionName);
      const threshold = this.thresholds.interaction[interactionName] || 'N/A';
      const meetsThreshold = this.meetsThreshold('interaction', interactionName, avg);
      
      result.interactions[interactionName] = {
        average: avg,
        min: Math.min(...metrics),
        max: Math.max(...metrics),
        count: metrics.length,
        threshold,
        meetsThreshold
      };
    }
    
    return result;
  }

  /**
   * Generate performance report
   * @returns {Object} Performance report
   */
  generateReport() {
    const metrics = this.getAllMetrics();
    
    // Calculate overall statistics
    const pageLoadMetrics = Object.values(metrics.pageLoads);
    const apiCallMetrics = Object.values(metrics.apiCalls);
    const interactionMetrics = Object.values(metrics.interactions);
    
    const pageLoadThresholdsMet = pageLoadMetrics.filter(m => m.meetsThreshold).length;
    const apiCallThresholdsMet = apiCallMetrics.filter(m => m.meetsThreshold).length;
    const interactionThresholdsMet = interactionMetrics.filter(m => m.meetsThreshold).length;
    
    const pageLoadThresholdsTotal = pageLoadMetrics.length;
    const apiCallThresholdsTotal = apiCallMetrics.length;
    const interactionThresholdsTotal = interactionMetrics.length;
    
    return {
      summary: {
        pageLoads: {
          thresholdsMet: pageLoadThresholdsMet,
          thresholdsTotal: pageLoadThresholdsTotal,
          passRate: pageLoadThresholdsTotal > 0 ? (pageLoadThresholdsMet / pageLoadThresholdsTotal * 100).toFixed(2) : 'N/A'
        },
        apiCalls: {
          thresholdsMet: apiCallThresholdsMet,
          thresholdsTotal: apiCallThresholdsTotal,
          passRate: apiCallThresholdsTotal > 0 ? (apiCallThresholdsMet / apiCallThresholdsTotal * 100).toFixed(2) : 'N/A'
        },
        interactions: {
          thresholdsMet: interactionThresholdsMet,
          thresholdsTotal: interactionThresholdsTotal,
          passRate: interactionThresholdsTotal > 0 ? (interactionThresholdsMet / interactionThresholdsTotal * 100).toFixed(2) : 'N/A'
        },
        overall: {
          thresholdsMet: pageLoadThresholdsMet + apiCallThresholdsMet + interactionThresholdsMet,
          thresholdsTotal: pageLoadThresholdsTotal + apiCallThresholdsTotal + interactionThresholdsTotal,
          passRate: (pageLoadThresholdsTotal + apiCallThresholdsTotal + interactionThresholdsTotal) > 0 ? 
            ((pageLoadThresholdsMet + apiCallThresholdsMet + interactionThresholdsMet) / 
             (pageLoadThresholdsTotal + apiCallThresholdsTotal + interactionThresholdsTotal) * 100).toFixed(2) : 'N/A'
        }
      },
      metrics
    };
  }
}

module.exports = PerformanceHelper;
