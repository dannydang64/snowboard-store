/**
 * Test Reporter
 * Generates detailed test reports and structured JSON payload
 * Implements the required output format for test results
 */
const fs = require('fs').promises;
const path = require('path');
const TestConfig = require('../framework/TestConfig');

class TestReporter {
  constructor() {
    this.testResults = [];
    this.reportPath = path.join(TestConfig.get('reporting.screenshotDirectory'), '../test-results.json');
  }

  /**
   * Record a test result
   * @param {Object} result - Test result object
   */
  recordTestResult(result) {
    // Ensure required fields are present
    const testResult = {
      testCaseId: result.testCaseId || `TC_${this.testResults.length + 1}`,
      testCaseName: result.testCaseName || 'Unnamed Test',
      description: result.description || '',
      featureArea: result.featureArea || 'General',
      priority: result.priority || 'P2',
      testType: result.testType || 'Positive',
      expectedResults: result.expectedResults || '',
      actualResults: result.actualResults || '',
      status: result.status || 'Unknown',
      potentialRootCause: result.status === 'Fail' ? (result.potentialRootCause || 'Unknown issue') : '',
      additionalNotes: result.additionalNotes || '',
      executionTime: result.executionTime || 0,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.push(testResult);
    return testResult;
  }

  /**
   * Create a test result from Jest test info
   * @param {Object} testInfo - Jest test information
   * @param {Object} options - Additional test options
   * @returns {Object} Test result object
   */
  createTestResultFromJest(testInfo, options = {}) {
    // Extract priority from test name (format: "P0: Test name")
    const priorityMatch = testInfo.name.match(/^P(\d+):/);
    const priority = priorityMatch ? `P${priorityMatch[1]}` : 'P2';
    
    // Remove priority prefix from test name
    const testName = testInfo.name.replace(/^P\d+:\s*/, '');
    
    // Determine test type from test name or options
    const isNegative = testName.toLowerCase().includes('invalid') || 
                       testName.toLowerCase().includes('error') ||
                       testName.toLowerCase().includes('fail') ||
                       options.testType === 'Negative';
    
    const testResult = {
      testCaseId: options.testCaseId || `TC_${this.testResults.length + 1}`,
      testCaseName: testName,
      description: options.description || testName,
      featureArea: options.featureArea || this._determineFeatureArea(testName),
      priority: priority,
      testType: isNegative ? 'Negative' : 'Positive',
      expectedResults: options.expectedResults || '',
      actualResults: testInfo.status === 'passed' ? 'Test passed successfully' : testInfo.errors.join('\n'),
      status: testInfo.status === 'passed' ? 'Pass' : 'Fail',
      potentialRootCause: testInfo.status === 'passed' ? '' : (options.potentialRootCause || this._determinePotentialCause(testInfo.errors)),
      additionalNotes: options.additionalNotes || '',
      executionTime: testInfo.duration || 0
    };
    
    return this.recordTestResult(testResult);
  }

  /**
   * Determine feature area from test name
   * @param {string} testName - Test name
   * @returns {string} Feature area
   * @private
   */
  _determineFeatureArea(testName) {
    const testNameLower = testName.toLowerCase();
    
    if (testNameLower.includes('cart')) return 'Shopping Cart';
    if (testNameLower.includes('checkout')) return 'Checkout Process';
    if (testNameLower.includes('product') && testNameLower.includes('detail')) return 'Product Details';
    if (testNameLower.includes('product')) return 'Product Browsing';
    if (testNameLower.includes('api')) return 'API';
    if (testNameLower.includes('order')) return 'Orders';
    if (testNameLower.includes('search')) return 'Search';
    if (testNameLower.includes('category')) return 'Categories';
    
    return 'General';
  }

  /**
   * Determine potential cause from error messages
   * @param {Array} errors - Error messages
   * @returns {string} Potential cause
   * @private
   */
  _determinePotentialCause(errors) {
    if (!errors || errors.length === 0) return 'Unknown issue';
    
    const errorStr = errors.join('\n');
    
    if (errorStr.includes('timeout')) return 'Timeout waiting for element or condition';
    if (errorStr.includes('selector')) return 'Element selector not found';
    if (errorStr.includes('expected') && errorStr.includes('received')) return 'Assertion failure - values did not match';
    if (errorStr.includes('network')) return 'Network request failed';
    if (errorStr.includes('localStorage')) return 'LocalStorage access issue';
    if (errorStr.includes('undefined') || errorStr.includes('null')) return 'Null or undefined value';
    
    return 'Test logic error';
  }

  /**
   * Get all test results
   * @returns {Array} Test results
   */
  getTestResults() {
    return this.testResults;
  }

  /**
   * Get summary of test results
   * @returns {Object} Test summary
   */
  getTestSummary() {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.status === 'Pass').length;
    const failed = this.testResults.filter(r => r.status === 'Fail').length;
    
    const byPriority = {
      P0: this.testResults.filter(r => r.priority === 'P0').length,
      P1: this.testResults.filter(r => r.priority === 'P1').length,
      P2: this.testResults.filter(r => r.priority === 'P2').length
    };
    
    const byFeature = {};
    this.testResults.forEach(result => {
      byFeature[result.featureArea] = (byFeature[result.featureArea] || 0) + 1;
    });
    
    return {
      total,
      passed,
      failed,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      byPriority,
      byFeature
    };
  }

  /**
   * Generate JSON payload for test results
   * @returns {Object} JSON payload
   */
  generateJsonPayload() {
    return {
      testResults: this.testResults,
      summary: this.getTestSummary(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Save test results to file
   * @returns {Promise<void>}
   */
  async saveResults() {
    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(this.reportPath);
      await fs.mkdir(dir, { recursive: true });
      
      // Save results
      const payload = this.generateJsonPayload();
      await fs.writeFile(this.reportPath, JSON.stringify(payload, null, 2), 'utf8');
      
      console.log(`Test results saved to ${this.reportPath}`);
    } catch (error) {
      console.error(`Error saving test results: ${error.message}`);
    }
  }
}

module.exports = new TestReporter();
