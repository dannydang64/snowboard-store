/**
 * Test Runner
 * Executes tests and generates structured JSON payload output
 * Implements the required output format for test results
 */
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');
const TestReporter = require('./utils/TestReporter');
const PerformanceMonitor = require('./utils/PerformanceMonitor');
const DataManager = require('./utils/DataManager');

// Configuration
const config = {
  testDir: path.join(__dirname, 'specs'),
  reportDir: path.join(__dirname, 'reports'),
  testPattern: process.argv[2] || '**/*.test.js',
  generateReport: true,
  saveScreenshots: true,
  collectPerformanceMetrics: true
};

/**
 * Main runner function
 */
async function runTests() {
  console.log('🚀 Starting Snow Ice E-commerce Test Suite');
  console.log(`📁 Test directory: ${config.testDir}`);
  console.log(`🔍 Test pattern: ${config.testPattern}`);
  
  // Ensure test data exists
  console.log('📊 Ensuring test data is available...');
  await DataManager.ensureTestDataExists();
  
  // Create report directory if it doesn't exist
  if (!fs.existsSync(config.reportDir)) {
    fs.mkdirSync(config.reportDir, { recursive: true });
  }
  
  // Start time for overall execution
  const startTime = Date.now();
  
  try {
    // Run Jest tests
    console.log('🧪 Running tests...');
    
    const jestCommand = `npx jest --config=./jest.config.js "${config.testPattern}" --runInBand`;
    
    try {
      execSync(jestCommand, { stdio: 'inherit' });
      console.log('✅ Tests completed successfully');
    } catch (error) {
      console.log('❌ Some tests failed');
      // Continue to generate report even if tests fail
    }
    
    // Calculate execution time
    const executionTime = Date.now() - startTime;
    
    // Generate and save test report
    if (config.generateReport) {
      console.log('📝 Generating test report...');
      
      // Add execution summary to report
      const summary = TestReporter.getTestSummary();
      summary.executionTime = executionTime;
      summary.timestamp = new Date().toISOString();
      
      // Add performance metrics if enabled
      if (config.collectPerformanceMetrics) {
        summary.performanceMetrics = PerformanceMonitor.generateSummary();
      }
      
      // Save test results
      await TestReporter.saveResults();
      
      console.log(`📊 Test report saved to ${path.join(config.reportDir, 'test-results.json')}`);
      
      // Print summary to console
      console.log('\n📋 Test Summary:');
      console.log(`Total Tests: ${summary.total}`);
      console.log(`Passed: ${summary.passed}`);
      console.log(`Failed: ${summary.failed}`);
      console.log(`Pass Rate: ${summary.passRate}%`);
      console.log(`Execution Time: ${(executionTime / 1000).toFixed(2)}s`);
    }
  } catch (error) {
    console.error('❌ Error running tests:', error);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
