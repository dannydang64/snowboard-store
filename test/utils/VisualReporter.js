/**
 * Visual Test Reporter
 * Provides enhanced visual reporting capabilities for test results
 */
class VisualReporter {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      skipped: [],
      duration: 0,
      startTime: null,
      endTime: null
    };
    
    this.categoryResults = {
      product: { passed: 0, failed: 0, skipped: 0 },
      cart: { passed: 0, failed: 0, skipped: 0 },
      checkout: { passed: 0, failed: 0, skipped: 0 },
      api: { passed: 0, failed: 0, skipped: 0 }
    };
    
    this.priorityResults = {
      P0: { passed: 0, failed: 0, total: 0 },
      P1: { passed: 0, failed: 0, total: 0 },
      P2: { passed: 0, failed: 0, total: 0 }
    };
  }
  
  /**
   * Process test results and generate visual reports
   * @param {Object} results - Jest test results
   */
  processResults(results) {
    this.results.startTime = new Date(results.startTime);
    this.results.endTime = new Date(results.endTime);
    this.results.duration = results.testResults.reduce((sum, suite) => sum + suite.perfStats.runtime, 0);
    
    // Process test results
    results.testResults.forEach(suite => {
      const suitePath = suite.testFilePath;
      const category = this._getCategoryFromPath(suitePath);
      
      suite.testResults.forEach(test => {
        const testName = test.title;
        const status = test.status;
        const priority = this._getPriorityFromName(testName);
        
        // Update category results
        if (category && this.categoryResults[category]) {
          this.categoryResults[category][status]++;
        }
        
        // Update priority results
        if (priority && this.priorityResults[priority]) {
          this.priorityResults[priority].total++;
          if (status === 'passed') {
            this.priorityResults[priority].passed++;
          } else if (status === 'failed') {
            this.priorityResults[priority].failed++;
          }
        }
        
        // Store test result
        const testResult = {
          name: testName,
          status,
          duration: test.duration,
          category,
          priority,
          failureMessages: test.failureMessages || []
        };
        
        if (status === 'passed') {
          this.results.passed.push(testResult);
        } else if (status === 'failed') {
          this.results.failed.push(testResult);
        } else {
          this.results.skipped.push(testResult);
        }
      });
    });
  }
  
  /**
   * Generate HTML report
   * @returns {string} HTML report
   */
  generateHtmlReport() {
    const totalTests = this.results.passed.length + this.results.failed.length + this.results.skipped.length;
    const passRate = totalTests > 0 ? (this.results.passed.length / totalTests * 100).toFixed(2) : 0;
    
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Snow Ice Test Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #2c3e50;
          }
          .summary {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .summary-box {
            background-color: #f8f9fa;
            border-radius: 5px;
            padding: 15px;
            width: 30%;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .passed { color: #28a745; }
          .failed { color: #dc3545; }
          .skipped { color: #6c757d; }
          .chart-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .chart {
            width: 48%;
            height: 300px;
            background-color: #f8f9fa;
            border-radius: 5px;
            padding: 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            padding: 12px 15px;
            border-bottom: 1px solid #ddd;
            text-align: left;
          }
          th {
            background-color: #f8f9fa;
          }
          tr:hover {
            background-color: #f5f5f5;
          }
          .test-name {
            font-weight: bold;
          }
          .duration {
            color: #6c757d;
            font-size: 0.9em;
          }
          .priority-P0 { background-color: #ffcccc; }
          .priority-P1 { background-color: #ffffcc; }
          .priority-P2 { background-color: #ccffcc; }
          .progress-bar {
            height: 20px;
            background-color: #e9ecef;
            border-radius: 5px;
            margin-top: 5px;
            overflow: hidden;
          }
          .progress {
            height: 100%;
            background-color: #28a745;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <h1>Snow Ice Test Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        
        <div class="summary">
          <div class="summary-box">
            <h3>Test Summary</h3>
            <p>Total Tests: ${totalTests}</p>
            <p><span class="passed">Passed: ${this.results.passed.length}</span></p>
            <p><span class="failed">Failed: ${this.results.failed.length}</span></p>
            <p><span class="skipped">Skipped: ${this.results.skipped.length}</span></p>
            <p>Pass Rate: ${passRate}%</p>
            <div class="progress-bar">
              <div class="progress" style="width: ${passRate}%"></div>
            </div>
          </div>
          
          <div class="summary-box">
            <h3>Duration</h3>
            <p>Start Time: ${this.results.startTime ? this.results.startTime.toLocaleString() : 'N/A'}</p>
            <p>End Time: ${this.results.endTime ? this.results.endTime.toLocaleString() : 'N/A'}</p>
            <p>Total Duration: ${(this.results.duration / 1000).toFixed(2)} seconds</p>
          </div>
          
          <div class="summary-box">
            <h3>Priority Coverage</h3>
            <p>P0: ${this._getPriorityPassRate('P0')}% (${this.priorityResults.P0.passed}/${this.priorityResults.P0.total})</p>
            <p>P1: ${this._getPriorityPassRate('P1')}% (${this.priorityResults.P1.passed}/${this.priorityResults.P1.total})</p>
            <p>P2: ${this._getPriorityPassRate('P2')}% (${this.priorityResults.P2.passed}/${this.priorityResults.P2.total})</p>
          </div>
        </div>
        
        <div class="chart-container">
          <div class="chart">
            <h3>Category Results</h3>
            <canvas id="categoryChart"></canvas>
          </div>
          
          <div class="chart">
            <h3>Priority Results</h3>
            <canvas id="priorityChart"></canvas>
          </div>
        </div>
        
        <h2>Failed Tests</h2>
        ${this._generateTestTable(this.results.failed)}
        
        <h2>Passed Tests</h2>
        ${this._generateTestTable(this.results.passed)}
        
        <h2>Skipped Tests</h2>
        ${this._generateTestTable(this.results.skipped)}
        
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
          // Category Chart
          const categoryCtx = document.getElementById('categoryChart').getContext('2d');
          new Chart(categoryCtx, {
            type: 'bar',
            data: {
              labels: ['Product', 'Cart', 'Checkout', 'API'],
              datasets: [
                {
                  label: 'Passed',
                  data: [
                    ${this.categoryResults.product.passed},
                    ${this.categoryResults.cart.passed},
                    ${this.categoryResults.checkout.passed},
                    ${this.categoryResults.api.passed}
                  ],
                  backgroundColor: '#28a745'
                },
                {
                  label: 'Failed',
                  data: [
                    ${this.categoryResults.product.failed},
                    ${this.categoryResults.cart.failed},
                    ${this.categoryResults.checkout.failed},
                    ${this.categoryResults.api.failed}
                  ],
                  backgroundColor: '#dc3545'
                },
                {
                  label: 'Skipped',
                  data: [
                    ${this.categoryResults.product.skipped},
                    ${this.categoryResults.cart.skipped},
                    ${this.categoryResults.checkout.skipped},
                    ${this.categoryResults.api.skipped}
                  ],
                  backgroundColor: '#6c757d'
                }
              ]
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                  stacked: false
                },
                x: {
                  stacked: false
                }
              }
            }
          });
          
          // Priority Chart
          const priorityCtx = document.getElementById('priorityChart').getContext('2d');
          new Chart(priorityCtx, {
            type: 'doughnut',
            data: {
              labels: ['P0 Passed', 'P0 Failed', 'P1 Passed', 'P1 Failed', 'P2 Passed', 'P2 Failed'],
              datasets: [{
                data: [
                  ${this.priorityResults.P0.passed},
                  ${this.priorityResults.P0.failed},
                  ${this.priorityResults.P1.passed},
                  ${this.priorityResults.P1.failed},
                  ${this.priorityResults.P2.passed},
                  ${this.priorityResults.P2.failed}
                ],
                backgroundColor: [
                  '#28a745', '#dc3545',
                  '#5cb85c', '#f0ad4e',
                  '#5bc0de', '#d9534f'
                ]
              }]
            }
          });
        </script>
      </body>
      </html>
    `;
    
    return html;
  }
  
  /**
   * Generate JSON report
   * @returns {Object} JSON report
   */
  generateJsonReport() {
    return {
      summary: {
        total: this.results.passed.length + this.results.failed.length + this.results.skipped.length,
        passed: this.results.passed.length,
        failed: this.results.failed.length,
        skipped: this.results.skipped.length,
        passRate: (this.results.passed.length / (this.results.passed.length + this.results.failed.length + this.results.skipped.length) * 100).toFixed(2)
      },
      duration: {
        startTime: this.results.startTime,
        endTime: this.results.endTime,
        totalMs: this.results.duration
      },
      categoryResults: this.categoryResults,
      priorityResults: this.priorityResults,
      tests: {
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped
      }
    };
  }
  
  /**
   * Get category from file path
   * @param {string} path - File path
   * @returns {string} Category name
   * @private
   */
  _getCategoryFromPath(path) {
    if (path.includes('product.test.js')) return 'product';
    if (path.includes('cart.test.js')) return 'cart';
    if (path.includes('checkout.test.js')) return 'checkout';
    if (path.includes('api.test.js')) return 'api';
    return 'other';
  }
  
  /**
   * Get priority from test name
   * @param {string} name - Test name
   * @returns {string} Priority
   * @private
   */
  _getPriorityFromName(name) {
    if (name.includes('P0:')) return 'P0';
    if (name.includes('P1:')) return 'P1';
    if (name.includes('P2:')) return 'P2';
    return null;
  }
  
  /**
   * Get pass rate for a priority
   * @param {string} priority - Priority (P0, P1, P2)
   * @returns {string} Pass rate percentage
   * @private
   */
  _getPriorityPassRate(priority) {
    const { passed, total } = this.priorityResults[priority];
    return total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';
  }
  
  /**
   * Generate HTML table for test results
   * @param {Array} tests - Test results
   * @returns {string} HTML table
   * @private
   */
  _generateTestTable(tests) {
    if (tests.length === 0) {
      return '<p>No tests in this category.</p>';
    }
    
    let html = `
      <table>
        <thead>
          <tr>
            <th>Test Name</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Duration</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    tests.forEach(test => {
      const priorityClass = test.priority ? `priority-${test.priority}` : '';
      
      html += `
        <tr class="${priorityClass}">
          <td class="test-name">${test.name}</td>
          <td>${test.category || 'N/A'}</td>
          <td>${test.priority || 'N/A'}</td>
          <td class="duration">${(test.duration / 1000).toFixed(2)}s</td>
          <td class="${test.status}">${test.status.toUpperCase()}</td>
        </tr>
      `;
      
      if (test.status === 'failed' && test.failureMessages && test.failureMessages.length > 0) {
        html += `
          <tr>
            <td colspan="5">
              <pre>${this._escapeHtml(test.failureMessages.join('\n'))}</pre>
            </td>
          </tr>
        `;
      }
    });
    
    html += `
        </tbody>
      </table>
    `;
    
    return html;
  }
  
  /**
   * Escape HTML special characters
   * @param {string} html - HTML string
   * @returns {string} Escaped HTML
   * @private
   */
  _escapeHtml(html) {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

module.exports = VisualReporter;
