/**
 * Assertion Helper
 * Provides enhanced assertion capabilities for tests
 * Implements soft assertions and detailed error messages
 */
const TestConfig = require('../framework/TestConfig');

class AssertionHelper {
  constructor() {
    this.softAssertions = [];
    this.isSoftAssertionMode = false;
  }

  /**
   * Start collecting soft assertions
   * Soft assertions don't fail the test immediately, allowing multiple checks
   */
  startSoftAssertions() {
    this.softAssertions = [];
    this.isSoftAssertionMode = true;
    return this;
  }

  /**
   * Verify all collected soft assertions
   * Fails the test if any soft assertions failed
   */
  verifySoftAssertions() {
    this.isSoftAssertionMode = false;
    
    if (this.softAssertions.length === 0) {
      return true;
    }
    
    const failures = this.softAssertions.filter(assertion => !assertion.passed);
    
    if (failures.length > 0) {
      const errorMessages = failures.map(failure => 
        `- ${failure.message}: expected ${JSON.stringify(failure.expected)} but got ${JSON.stringify(failure.actual)}`
      ).join('\n');
      
      throw new Error(`${failures.length} soft assertions failed:\n${errorMessages}`);
    }
    
    return true;
  }

  /**
   * Add a soft assertion result
   * @param {boolean} passed - Whether the assertion passed
   * @param {string} message - Assertion message
   * @param {any} expected - Expected value
   * @param {any} actual - Actual value
   */
  _addSoftAssertion(passed, message, expected, actual) {
    if (this.isSoftAssertionMode) {
      this.softAssertions.push({ passed, message, expected, actual });
      return passed;
    } else if (!passed) {
      throw new Error(`Assertion failed: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    }
    return passed;
  }

  /**
   * Assert that two values are equal
   * @param {any} actual - Actual value
   * @param {any} expected - Expected value
   * @param {string} message - Assertion message
   */
  assertEquals(actual, expected, message = 'Values should be equal') {
    const passed = actual === expected;
    return this._addSoftAssertion(passed, message, expected, actual);
  }

  /**
   * Assert that a value is truthy
   * @param {any} value - Value to check
   * @param {string} message - Assertion message
   */
  assertTrue(value, message = 'Value should be truthy') {
    const passed = !!value;
    return this._addSoftAssertion(passed, message, true, !!value);
  }

  /**
   * Assert that a value is falsy
   * @param {any} value - Value to check
   * @param {string} message - Assertion message
   */
  assertFalse(value, message = 'Value should be falsy') {
    const passed = !value;
    return this._addSoftAssertion(passed, message, false, !!value);
  }

  /**
   * Assert that a value contains a substring or item
   * @param {string|Array} actual - Actual value
   * @param {string|any} expected - Expected substring or item
   * @param {string} message - Assertion message
   */
  assertContains(actual, expected, message = 'Value should contain expected') {
    let passed = false;
    
    if (typeof actual === 'string') {
      passed = actual.includes(expected);
    } else if (Array.isArray(actual)) {
      passed = actual.includes(expected);
    } else if (actual && typeof actual === 'object') {
      passed = Object.values(actual).includes(expected);
    }
    
    return this._addSoftAssertion(passed, message, `to contain ${expected}`, actual);
  }

  /**
   * Assert that a value matches a regular expression
   * @param {string} actual - Actual value
   * @param {RegExp} regex - Regular expression to match
   * @param {string} message - Assertion message
   */
  assertMatches(actual, regex, message = 'Value should match pattern') {
    const passed = regex.test(actual);
    return this._addSoftAssertion(passed, message, regex.toString(), actual);
  }

  /**
   * Assert that a value is greater than another value
   * @param {number} actual - Actual value
   * @param {number} expected - Expected minimum value
   * @param {string} message - Assertion message
   */
  assertGreaterThan(actual, expected, message = 'Value should be greater') {
    const passed = actual > expected;
    return this._addSoftAssertion(passed, message, `> ${expected}`, actual);
  }

  /**
   * Assert that a value is less than another value
   * @param {number} actual - Actual value
   * @param {number} expected - Expected maximum value
   * @param {string} message - Assertion message
   */
  assertLessThan(actual, expected, message = 'Value should be less') {
    const passed = actual < expected;
    return this._addSoftAssertion(passed, message, `< ${expected}`, actual);
  }

  /**
   * Assert that two objects have the same properties and values
   * @param {Object} actual - Actual object
   * @param {Object} expected - Expected object
   * @param {string} message - Assertion message
   */
  assertObjectEquals(actual, expected, message = 'Objects should be equal') {
    const actualJson = JSON.stringify(actual);
    const expectedJson = JSON.stringify(expected);
    const passed = actualJson === expectedJson;
    return this._addSoftAssertion(passed, message, expected, actual);
  }

  /**
   * Assert that an object has a specific property
   * @param {Object} obj - Object to check
   * @param {string} prop - Property name
   * @param {string} message - Assertion message
   */
  assertHasProperty(obj, prop, message = 'Object should have property') {
    const passed = obj && Object.prototype.hasOwnProperty.call(obj, prop);
    return this._addSoftAssertion(passed, message, `to have property ${prop}`, Object.keys(obj || {}));
  }

  /**
   * Assert that a value is within a specific range
   * @param {number} actual - Actual value
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @param {string} message - Assertion message
   */
  assertInRange(actual, min, max, message = 'Value should be in range') {
    const passed = actual >= min && actual <= max;
    return this._addSoftAssertion(passed, message, `between ${min} and ${max}`, actual);
  }

  /**
   * Assert that a function throws an error
   * @param {Function} fn - Function to execute
   * @param {string|RegExp} [errorMatcher] - Expected error message or pattern
   * @param {string} message - Assertion message
   */
  assertThrows(fn, errorMatcher, message = 'Function should throw') {
    let passed = false;
    let actualError = null;
    
    try {
      fn();
    } catch (error) {
      actualError = error;
      
      if (errorMatcher) {
        if (errorMatcher instanceof RegExp) {
          passed = errorMatcher.test(error.message);
        } else if (typeof errorMatcher === 'string') {
          passed = error.message.includes(errorMatcher);
        } else {
          passed = true;
        }
      } else {
        passed = true;
      }
    }
    
    return this._addSoftAssertion(
      passed, 
      message, 
      errorMatcher ? `error matching ${errorMatcher}` : 'any error', 
      actualError ? actualError.message : 'no error thrown'
    );
  }

  /**
   * Assert that an API response has the expected status
   * @param {Object} response - API response object
   * @param {number} expectedStatus - Expected status code
   * @param {string} message - Assertion message
   */
  assertResponseStatus(response, expectedStatus, message = 'Response status should match') {
    const status = response.status || response.statusCode;
    const passed = status === expectedStatus;
    return this._addSoftAssertion(passed, message, expectedStatus, status);
  }

  /**
   * Assert that a response time is below threshold
   * @param {number} responseTime - Response time in ms
   * @param {number} threshold - Threshold in ms
   * @param {string} message - Assertion message
   */
  assertResponseTime(responseTime, threshold, message = 'Response time should be below threshold') {
    const passed = responseTime <= threshold;
    return this._addSoftAssertion(passed, message, `<= ${threshold}ms`, `${responseTime}ms`);
  }

  /**
   * Assert that a cart contains a specific product
   * @param {Array} cartItems - Cart items
   * @param {string} productId - Product ID to check for
   * @param {number} [quantity] - Expected quantity (optional)
   * @param {string} message - Assertion message
   */
  assertCartContainsProduct(cartItems, productId, quantity, message = 'Cart should contain product') {
    const item = cartItems.find(item => item.productId === productId || item.id === productId);
    const passed = !!item && (quantity === undefined || item.quantity === quantity);
    
    return this._addSoftAssertion(
      passed, 
      message, 
      quantity !== undefined ? `product ${productId} with quantity ${quantity}` : `product ${productId}`, 
      item ? `product ${item.productId || item.id} with quantity ${item.quantity}` : 'not found'
    );
  }

  /**
   * Assert that a form field has validation error
   * @param {string} selector - Field selector
   * @param {string} [errorText] - Expected error text (optional)
   * @param {string} message - Assertion message
   */
  async assertFormFieldError(selector, errorText, message = 'Field should have validation error') {
    // Check for common error indicators
    const hasError = await page.evaluate((sel) => {
      const field = document.querySelector(sel);
      if (!field) return false;
      
      // Check for aria-invalid attribute
      if (field.getAttribute('aria-invalid') === 'true') return true;
      
      // Check for error class
      if (field.classList.contains('error') || field.classList.contains('invalid')) return true;
      
      // Check for adjacent error message
      const parent = field.parentElement;
      const errorElements = parent.querySelectorAll('.error-message, .validation-error, .text-red-500');
      return errorElements.length > 0;
    }, selector);
    
    let errorMatch = true;
    
    if (hasError && errorText) {
      // If specific error text is expected, check for it
      errorMatch = await page.evaluate((sel, expectedText) => {
        const field = document.querySelector(sel);
        if (!field) return false;
        
        const parent = field.parentElement;
        const errorElements = parent.querySelectorAll('.error-message, .validation-error, .text-red-500');
        
        for (const el of errorElements) {
          if (el.textContent.includes(expectedText)) return true;
        }
        
        return false;
      }, selector, errorText);
    }
    
    const passed = hasError && errorMatch;
    return this._addSoftAssertion(
      passed, 
      message, 
      errorText ? `validation error with text "${errorText}"` : 'validation error', 
      passed ? 'has error' : 'no error found'
    );
  }
}

module.exports = new AssertionHelper();
