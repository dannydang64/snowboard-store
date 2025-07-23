/**
 * Performance Monitor
 * Tracks and reports performance metrics for tests
 * Helps identify performance regressions and bottlenecks
 */
const fs = require('fs').promises;
const path = require('path');
const TestConfig = require('../framework/TestConfig');

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.thresholds = TestConfig.get('reporting.performanceThresholds');
    this.reportPath = path.join(TestConfig.get('reporting.screenshotDirectory'), '../performance-report.json');
    this.isEnabled = TestConfig.get('reporting.performanceReporting');
  }

  /**
   * Start measuring a performance metric
   * @param {string} name - Name of the metric
   * @returns {Object} Metric object with start time
   */
  startMeasurement(name) {
    if (!this.isEnabled) return { name };
    
    const metric = {
      name,
      startTime: performance.now(),
      startMemory: process.memoryUsage().heapUsed,
    };
    
    this.metrics[name] = metric;
    return metric;
  }

  /**
   * End measuring a performance metric
   * @param {string} name - Name of the metric
   * @returns {Object} Metric object with duration
   */
  endMeasurement(name) {
    if (!this.isEnabled || !this.metrics[name]) return null;
    
    const metric = this.metrics[name];
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;
    
    metric.endTime = endTime;
    metric.duration = endTime - metric.startTime;
    metric.memoryUsage = endMemory - metric.startMemory;
    
    return metric;
  }

  /**
   * Measure the execution time of a function
   * @param {string} name - Name of the metric
   * @param {Function} fn - Function to measure
   * @returns {Promise<any>} Result of the function
   */
  async measure(name, fn) {
    this.startMeasurement(name);
    
    try {
      const result = await fn();
      return result;
    } finally {
      this.endMeasurement(name);
    }
  }

  /**
   * Measure page load time
   * @param {string} url - URL to navigate to
   * @param {string} name - Name for this measurement
   * @returns {Promise<Object>} Metric object with duration
   */
  async measurePageLoad(url, name = 'pageLoad') {
    if (!this.isEnabled) {
      await page.goto(url, { waitUntil: 'networkidle0' });
      return null;
    }
    
    const metricName = `${name}:${url.split('/').pop()}`;
    this.startMeasurement(metricName);
    
    // Create performance observer to capture navigation timing
    await page.evaluate(() => {
      window.performanceEntries = [];
      const observer = new PerformanceObserver((list) => {
        window.performanceEntries.push(...list.getEntries());
      });
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    });
    
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // Collect performance metrics from the page
    const performanceMetrics = await page.evaluate(() => {
      const navEntry = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.startTime,
        load: navEntry.loadEventEnd - navEntry.startTime,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        resources: window.performanceEntries
          .filter(entry => entry.entryType === 'resource')
          .map(entry => ({
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize
          }))
      };
    });
    
    const metric = this.endMeasurement(metricName);
    
    if (metric) {
      metric.performanceMetrics = performanceMetrics;
      
      // Check against thresholds
      metric.exceedsThreshold = metric.duration > this.thresholds.pageLoad;
      
      if (metric.exceedsThreshold) {
        console.warn(`⚠️ Performance warning: ${metricName} took ${metric.duration.toFixed(2)}ms, exceeding threshold of ${this.thresholds.pageLoad}ms`);
      }
    }
    
    return metric;
  }

  /**
   * Measure API response time
   * @param {string} name - Name for this API call
   * @param {Function} apiFn - Function that makes the API call
   * @returns {Promise<Object>} API response and performance metric
   */
  async measureApiCall(name, apiFn) {
    const metricName = `api:${name}`;
    this.startMeasurement(metricName);
    
    try {
      const response = await apiFn();
      const metric = this.endMeasurement(metricName);
      
      if (this.isEnabled && metric) {
        metric.status = response.status || response.statusCode;
        metric.exceedsThreshold = metric.duration > this.thresholds.apiResponse;
        
        if (metric.exceedsThreshold) {
          console.warn(`⚠️ Performance warning: API ${name} took ${metric.duration.toFixed(2)}ms, exceeding threshold of ${this.thresholds.apiResponse}ms`);
        }
      }
      
      return { response, metric };
    } catch (error) {
      this.endMeasurement(metricName);
      throw error;
    }
  }

  /**
   * Get all collected metrics
   * @returns {Object} All metrics
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Get a specific metric by name
   * @param {string} name - Metric name
   * @returns {Object} Metric object
   */
  getMetric(name) {
    return this.metrics[name];
  }

  /**
   * Check if any metrics exceed their thresholds
   * @returns {Array} Array of metrics that exceed thresholds
   */
  getExceedingMetrics() {
    return Object.values(this.metrics).filter(metric => metric.exceedsThreshold);
  }

  /**
   * Save performance report to file
   * @param {string} testName - Name of the test
   * @returns {Promise<void>}
   */
  async saveReport(testName) {
    if (!this.isEnabled) return;
    
    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(this.reportPath);
      await fs.mkdir(dir, { recursive: true });
      
      // Load existing report if it exists
      let report = {};
      try {
        const existingReport = await fs.readFile(this.reportPath, 'utf8');
        report = JSON.parse(existingReport);
      } catch (error) {
        // File doesn't exist or is invalid, start with empty report
        report = { tests: {} };
      }
      
      // Add metrics for this test
      report.tests[testName] = {
        timestamp: new Date().toISOString(),
        metrics: this.metrics
      };
      
      // Save updated report
      await fs.writeFile(this.reportPath, JSON.stringify(report, null, 2), 'utf8');
      
      // Reset metrics for next test
      this.metrics = {};
    } catch (error) {
      console.error(`Error saving performance report: ${error.message}`);
    }
  }

  /**
   * Generate a performance summary for the test run
   * @returns {Object} Performance summary
   */
  generateSummary() {
    if (!this.isEnabled) return null;
    
    const pageLoads = Object.values(this.metrics).filter(m => m.name.startsWith('pageLoad:'));
    const apiCalls = Object.values(this.metrics).filter(m => m.name.startsWith('api:'));
    
    const summary = {
      timestamp: new Date().toISOString(),
      totalMetrics: Object.keys(this.metrics).length,
      exceedingThresholds: this.getExceedingMetrics().length,
      averages: {
        pageLoad: this._calculateAverage(pageLoads, 'duration'),
        apiResponse: this._calculateAverage(apiCalls, 'duration')
      },
      slowest: {
        pageLoad: this._findSlowest(pageLoads),
        apiCall: this._findSlowest(apiCalls)
      }
    };
    
    return summary;
  }

  /**
   * Calculate average of a metric property
   * @param {Array} metrics - Array of metrics
   * @param {string} property - Property to average
   * @returns {number} Average value
   * @private
   */
  _calculateAverage(metrics, property) {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((total, metric) => total + metric[property], 0);
    return sum / metrics.length;
  }

  /**
   * Find the slowest metric
   * @param {Array} metrics - Array of metrics
   * @returns {Object} Slowest metric
   * @private
   */
  _findSlowest(metrics) {
    if (metrics.length === 0) return null;
    return metrics.reduce((slowest, metric) => 
      metric.duration > slowest.duration ? metric : slowest, metrics[0]);
  }
}

module.exports = new PerformanceMonitor();
