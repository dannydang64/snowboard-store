#!/usr/bin/env node

/**
 * Test Runner Script
 * Runs tests and generates comprehensive reports
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const config = {
  testCommand: 'jest',
  testArgs: [],
  reportDir: path.join(__dirname, 'reports'),
  screenshotDir: path.join(__dirname, 'reports', 'screenshots'),
  summaryFile: path.join(__dirname, 'reports', 'test-summary.json'),
  htmlReportFile: path.join(__dirname, 'reports', 'test-report.html')
};

// Parse command line arguments
const args = process.argv.slice(2);
let testSuite = null;
let parallel = false;
let headless = true;

args.forEach(arg => {
  if (arg === '--parallel' || arg === '-p') {
    parallel = true;
    config.testArgs.push('--maxWorkers=4');
  } else if (arg === '--headed' || arg === '-h') {
    headless = false;
    process.env.HEADLESS = 'false';
  } else if (arg === '--product') {
    testSuite = 'product';
    config.testArgs.push('-t', 'Product');
  } else if (arg === '--cart') {
    testSuite = 'cart';
    config.testArgs.push('-t', 'Cart');
  } else if (arg === '--checkout') {
    testSuite = 'checkout';
    config.testArgs.push('-t', 'Checkout');
  } else if (arg === '--api') {
    testSuite = 'api';
    config.testArgs.push('-t', 'API');
  } else if (arg === '--performance') {
    testSuite = 'performance';
    config.testArgs.push('-t', 'Performance');
  } else if (arg === '--help') {
    printHelp();
    process.exit(0);
  }
});

// Add config file
config.testArgs.push('--config=./jest.config.js');

// Create report directories
if (!fs.existsSync(config.reportDir)) {
  fs.mkdirSync(config.reportDir, { recursive: true });
}

if (!fs.existsSync(config.screenshotDir)) {
  fs.mkdirSync(config.screenshotDir, { recursive: true });
}

// Print test configuration
console.log('=== Snow Ice Test Runner ===');
console.log(`Test Suite: ${testSuite || 'All'}`);
console.log(`Parallel Execution: ${parallel ? 'Yes' : 'No'}`);
console.log(`Headless Mode: ${headless ? 'Yes' : 'No'}`);
console.log('===========================');

// Run tests
console.log('Starting tests...');
const startTime = Date.now();

const testProcess = spawn('npx', [config.testCommand, ...config.testArgs], {
  stdio: 'pipe',
  env: { ...process.env }
});

// Create readline interface for stdout
const rlStdout = readline.createInterface({
  input: testProcess.stdout,
  terminal: false
});

// Create readline interface for stderr
const rlStderr = readline.createInterface({
  input: testProcess.stderr,
  terminal: false
});

// Process stdout
rlStdout.on('line', (line) => {
  console.log(line);
});

// Process stderr
rlStderr.on('line', (line) => {
  console.error(line);
});

// Handle test completion
testProcess.on('close', (code) => {
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log(`\nTests completed in ${duration.toFixed(2)} seconds with exit code ${code}`);
  
  // Check if test results file exists
  const testResultsFile = path.join(config.reportDir, 'test-results.json');
  if (fs.existsSync(testResultsFile)) {
    try {
      const testResults = JSON.parse(fs.readFileSync(testResultsFile, 'utf8'));
      
      // Generate summary
      const summary = {
        timestamp: new Date().toISOString(),
        duration,
        exitCode: code,
        testSuite,
        parallel,
        headless,
        results: {
          total: testResults.summary.total,
          passed: testResults.summary.passed,
          failed: testResults.summary.failed,
          skipped: testResults.summary.skipped,
          passRate: testResults.summary.passRate
        },
        categoryResults: testResults.categoryResults,
        priorityResults: testResults.priorityResults
      };
      
      // Save summary
      fs.writeFileSync(config.summaryFile, JSON.stringify(summary, null, 2));
      
      // Print summary table
      console.log('\n=== Test Summary ===');
      console.log(`Total Tests: ${summary.results.total}`);
      console.log(`Passed: ${summary.results.passed}`);
      console.log(`Failed: ${summary.results.failed}`);
      console.log(`Skipped: ${summary.results.skipped}`);
      console.log(`Pass Rate: ${summary.results.passRate}%`);
      console.log('===================');
      
      // Print report locations
      console.log(`\nHTML Report: ${config.htmlReportFile}`);
      console.log(`JSON Summary: ${config.summaryFile}`);
      
      // Check for performance report
      const perfReportFile = path.join(config.reportDir, 'performance-report.json');
      if (fs.existsSync(perfReportFile)) {
        console.log(`Performance Report: ${perfReportFile}`);
      }
    } catch (error) {
      console.error('Error processing test results:', error);
    }
  }
  
  process.exit(code);
});

// Print help message
function printHelp() {
  console.log(`
Snow Ice Test Runner

Usage: node run-tests.js [options]

Options:
  --product       Run only product browsing tests
  --cart          Run only shopping cart tests
  --checkout      Run only checkout process tests
  --api           Run only API endpoint tests
  --performance   Run only performance tests
  --parallel, -p  Run tests in parallel
  --headed, -h    Run tests in headed mode (non-headless)
  --help          Show this help message

Examples:
  node run-tests.js                  Run all tests in headless mode
  node run-tests.js --product -h     Run product tests in headed mode
  node run-tests.js --api --parallel Run API tests in parallel
  `);
}
