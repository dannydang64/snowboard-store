# Snow Ice E-commerce Test Automation Framework

This test automation framework is designed to test the Snow Ice snowboard equipment e-commerce application. It provides comprehensive test coverage for product browsing, shopping cart functionality, checkout process, and API endpoints.

## Framework Architecture

The framework follows a Page Object Model (POM) design pattern and is built with:

- **Jest**: Test runner and assertion library
- **Puppeteer**: Browser automation tool
- **Axios**: HTTP client for API testing
- **Faker**: Test data generation

## Directory Structure

```
test/
├── framework/         # Core framework components
├── pages/            # Page Object Models
├── specs/            # Test specifications
├── utils/            # Utility classes
├── data/             # Test data
├── reports/          # Test reports
├── config.js         # Test configuration
└── best-practices-framework-context.yaml  # Best practices configuration
```

## Test Coverage

The framework provides test coverage for:

1. **Product Browsing**
   - Category navigation
   - Product details
   - Related products
   - Product images

2. **Shopping Cart**
   - Add to cart
   - Update quantities
   - Remove items
   - Cart persistence
   - Cart calculations

3. **Checkout Process**
   - Form validation
   - Order summary
   - Payment processing
   - Order confirmation

4. **API Endpoints**
   - Products API
   - Cart API
   - Orders API
   - Error handling

5. **Performance Testing**
   - Page load times
   - API response times
   - User interaction times

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Navigate to the test directory:
   ```
   cd /Users/danny.dang/github/snowboard_demo/snowboard-store-clean/test
   ```

2. Run the setup script to install dependencies:
   ```
   ./setup.sh
   ```

## Running Tests

The framework supports two test modes:

- **Live Mode**: Tests run against a live application (requires the application to be running)
- **Mock Mode**: Tests run with mock data (no need for the application to be running)

### Run tests in Mock Mode (default)

```
node run-tests.js
```

### Run tests in Live Mode

```
TEST_MODE=live node run-tests.js
```

### Run specific test suites

```
node run-tests.js --product    # Run product browsing tests
node run-tests.js --cart       # Run shopping cart tests
node run-tests.js --checkout   # Run checkout process tests
node run-tests.js --api        # Run API endpoint tests
node run-tests.js --performance # Run performance tests
```

### Run tests in parallel

```
node run-tests.js --parallel
```

### Run tests in headed mode (non-headless)

```
node run-tests.js --headed
```

### Get help

```
node run-tests.js --help
```

## Test Reports

After running tests, reports will be available in the `reports` directory:

```
test/reports/test-report.html     # HTML test report
test/reports/test-summary.json    # JSON test summary
test/reports/performance-report.json # Performance test report
```

Screenshots of test failures will be saved in:

```
test/reports/screenshots/
```

## Test Configuration

The test configuration is defined in `config.js`. You can modify this file to change:

- Base URL for the application
- Test mode (live or mock)
- Browser settings
- API settings
- Performance thresholds
- Test data

## Best Practices

The framework follows these best practices:

1. **Page Object Model**: Separates test logic from page interactions
2. **Explicit Waits**: Avoids fixed delays and uses explicit waits for elements
3. **Test Independence**: Each test can run independently
4. **Descriptive Assertions**: Clear assertion messages for better debugging
5. **Proper Error Handling**: Robust error handling and reporting
6. **Test Data Management**: External test data for better maintainability
7. **Mock Mode**: Ability to run tests without a live application
8. **Visual Reporting**: Enhanced visual reports with charts and metrics
9. **Performance Testing**: Measurement of page load times, API response times, and user interactions

## Extending the Framework

To add new tests:

1. Create or update page objects in the `pages` directory
2. Add new test specifications in the `specs` directory
3. Run the tests to verify they work as expected

## Troubleshooting

If tests are failing, check:

1. If running in live mode, ensure the Snow Ice application is running on http://localhost:3000
2. All dependencies are installed correctly
3. The test environment has proper network access
4. Browser compatibility (tests are designed for Chromium-based browsers)
5. Try running in mock mode to isolate application vs. test framework issues

## Contact

For questions or support, please contact the development team.
