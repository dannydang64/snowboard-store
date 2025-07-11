const fs = require('fs');
const path = require('path');
const VisualReporter = require('./VisualReporter');

/**
 * Custom Jest Reporter
 * Integrates with our Visual Reporter to generate enhanced test reports
 */
class CustomJestReporter {
  constructor(globalConfig, options) {
    this.globalConfig = globalConfig;
    this.options = options || {};
    this.visualReporter = new VisualReporter();
    this.outputDirectory = options.outputDirectory || path.join(process.cwd(), 'reports');
    this.includeConsoleOutput = options.includeConsoleOutput || false;
  }

  /**
   * Called when all tests are complete
   * @param {Object} contexts - Jest test contexts
   * @param {Object} results - Jest test results
   */
  onRunComplete(contexts, results) {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDirectory)) {
      fs.mkdirSync(this.outputDirectory, { recursive: true });
    }

    // Process results with visual reporter
    this.visualReporter.processResults(results);

    // Generate and save HTML report
    const htmlReport = this.visualReporter.generateHtmlReport();
    const htmlReportPath = path.join(this.outputDirectory, 'visual-report.html');
    fs.writeFileSync(htmlReportPath, htmlReport);

    // Generate and save JSON report
    const jsonReport = this.visualReporter.generateJsonReport();
    const jsonReportPath = path.join(this.outputDirectory, 'test-results.json');
    fs.writeFileSync(jsonReportPath, JSON.stringify(jsonReport, null, 2));

    // Log report location
    console.log(`\nVisual test report generated at: ${htmlReportPath}`);
    console.log(`JSON test results saved to: ${jsonReportPath}`);

    // Print summary
    this._printSummary(results);
  }

  /**
   * Print test summary to console
   * @param {Object} results - Jest test results
   * @private
   */
  _printSummary(results) {
    const { numTotalTests, numPassedTests, numFailedTests, numPendingTests } = results;
    const passRate = ((numPassedTests / numTotalTests) * 100).toFixed(2);

    console.log('\n========== Test Summary ==========');
    console.log(`Total Tests: ${numTotalTests}`);
    console.log(`Passed: ${numPassedTests}`);
    console.log(`Failed: ${numFailedTests}`);
    console.log(`Skipped: ${numPendingTests}`);
    console.log(`Pass Rate: ${passRate}%`);
    console.log('==================================\n');

    // Print category results
    const categoryResults = this.visualReporter.categoryResults;
    console.log('Category Results:');
    for (const [category, results] of Object.entries(categoryResults)) {
      const total = results.passed + results.failed + results.skipped;
      const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(2) : '0.00';
      console.log(`  ${category}: ${passRate}% (${results.passed}/${total})`);
    }

    // Print priority results
    const priorityResults = this.visualReporter.priorityResults;
    console.log('\nPriority Results:');
    for (const [priority, results] of Object.entries(priorityResults)) {
      const passRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(2) : '0.00';
      console.log(`  ${priority}: ${passRate}% (${results.passed}/${results.total})`);
    }
  }
}

module.exports = CustomJestReporter;
