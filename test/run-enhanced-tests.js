#!/usr/bin/env node

/**
 * Enhanced Test Runner Script
 * Executes the enhanced test framework for the Snow Ice e-commerce application
 * Generates structured JSON payload output as required
 */
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');
const TestReporter = require('./utils/TestReporter');
const DataManager = require('./utils/DataManager');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  testPattern: args.find(arg => !arg.startsWith('--')) || '**/*.test.js',
  headed: args.includes('--headed'),
  parallel: args.includes('--parallel'),
  mock: args.includes('--mock'),
  verbose: args.includes('--verbose'),
  help: args.includes('--help')
};

// Show help if requested
if (options.help) {
  console.log(`
Snow Ice Enhanced Test Runner
=============================

Usage: node run-enhanced-tests.js [options] [test-pattern]

Options:
  --headed       Run tests in headed mode (with browser UI visible)
  --parallel     Run tests in parallel (may cause issues with some tests)
  --mock         Run tests in mock mode (no real browser/API interactions)
  --verbose      Show detailed test output
  --help         Show this help message

Examples:
  node run-enhanced-tests.js                       # Run all tests
  node run-enhanced-tests.js product-browsing.test.js  # Run specific test file
  node run-enhanced-tests.js --headed              # Run with browser UI visible
  node run-enhanced-tests.js --mock                # Run in mock mode
  `);
  process.exit(0);
}

/**
 * Main runner function
 */
async function runTests() {
  console.log('\n🏂 Snow Ice Enhanced Test Framework 🏂');
  console.log('=======================================');
  console.log(`Running tests: ${options.testPattern}`);
  console.log(`Mode: ${options.mock ? 'Mock' : 'Browser'} ${options.headed ? '(Headed)' : '(Headless)'}`);
  console.log(`Parallel: ${options.parallel ? 'Yes' : 'No'}`);
  console.log('---------------------------------------');
  
  // Set environment variables based on options
  process.env.TEST_MODE = options.mock ? 'mock' : 'browser';
  process.env.HEADLESS = options.headed ? 'false' : 'true';
  
  // Ensure test data exists
  console.log('📊 Ensuring test data is available...');
  await DataManager.ensureTestDataExists();
  
  // Create reports directory if it doesn't exist
  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Start time for overall execution
  const startTime = Date.now();
  
  try {
    // Run Jest tests
    console.log('🧪 Running tests...');
    
    const jestArgs = [
      '--config=./jest.config.js',
      `"${options.testPattern}"`,
      options.parallel ? '--maxWorkers=4' : '--runInBand',
      options.verbose ? '--verbose' : ''
    ].filter(Boolean);
    
    const jestCommand = `npx jest ${jestArgs.join(' ')}`;
    
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
    console.log('📝 Generating enhanced test report...');
    
    // Get test results from TestReporter
    const testResults = TestReporter.getTestResults();
    const summary = TestReporter.getTestSummary();
    summary.executionTime = executionTime;
    summary.timestamp = new Date().toISOString();
    
    // Save test results to JSON file
    await TestReporter.saveResults();
    
    // Generate the required JSON payload
    const jsonPayload = TestReporter.generateJsonPayload();
    
    // Save JSON payload to file
    const payloadPath = path.join(reportsDir, 'test-results-payload.json');
    fs.writeFileSync(payloadPath, JSON.stringify(jsonPayload, null, 2), 'utf8');
    
    console.log(`📊 Test results saved to ${payloadPath}`);
    
    // Print summary to console
    console.log('\n📋 Test Summary:');
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Pass Rate: ${summary.passRate}%`);
    console.log(`Execution Time: ${(executionTime / 1000).toFixed(2)}s`);
    
    // Print priority breakdown
    if (summary.byPriority) {
      console.log('\nPriority Breakdown:');
      Object.entries(summary.byPriority).forEach(([priority, count]) => {
        console.log(`${priority}: ${count} tests`);
      });
    }
    
    // Print feature area breakdown
    if (summary.byFeature) {
      console.log('\nFeature Area Breakdown:');
      Object.entries(summary.byFeature).forEach(([feature, count]) => {
        console.log(`${feature}: ${count} tests`);
      });
    }
    
    console.log('\n✨ Enhanced test execution complete ✨');
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
