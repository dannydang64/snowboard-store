/**
 * Enhanced Base Test class
 * Extends the existing BaseTest with additional functionality
 * Implements best practices from the framework context
 */
const BaseTest = require('./BaseTest');
const TestConfig = require('./TestConfig');
const WaitHelper = require('../utils/WaitHelper');
const AssertionHelper = require('../utils/AssertionHelper');
const DataManager = require('../utils/DataManager');
const PerformanceMonitor = require('../utils/PerformanceMonitor');

class EnhancedBaseTest extends BaseTest {
  constructor() {
    super();
    
    // Initialize enhanced utilities
    this.wait = WaitHelper;
    this.assert = AssertionHelper;
    this.data = DataManager;
    this.performance = PerformanceMonitor;
    
    // Test metadata
    this.testInfo = {
      name: expect.getState().currentTestName,
      startTime: Date.now(),
      status: 'running',
      errors: []
    };
  }

  /**
   * Setup method to run before each test
   * @param {Object} options - Setup options
   */
  async setup(options = {}) {
    // Ensure test data exists
    await this.data.ensureTestDataExists();
    
    // Clear the cart before each test
    await this.clearCart();
    
    // Navigate to home page if requested
    if (options.navigateToHome) {
      await this.navigateToHome();
    }
    
    // Start performance monitoring
    if (options.monitorPerformance) {
      this.performance.startMeasurement(`test:${this.testInfo.name}`);
    }
  }

  /**
   * Teardown method to run after each test
   */
  async teardown() {
    // End performance monitoring
    this.performance.endMeasurement(`test:${this.testInfo.name}`);
    
    // Save performance report
    await this.performance.saveReport(this.testInfo.name);
    
    // Update test status
    this.testInfo.endTime = Date.now();
    this.testInfo.duration = this.testInfo.endTime - this.testInfo.startTime;
    this.testInfo.status = 'completed';
  }

  /**
   * Navigate to the home page with performance monitoring
   */
  async navigateToHome() {
    await this.performance.measurePageLoad(`${this.baseUrl}/`, 'homePage');
  }

  /**
   * Navigate to a specific URL with performance monitoring
   * @param {string} path - URL path
   */
  async navigateTo(path) {
    const url = `${this.baseUrl}${path}`;
    await this.performance.measurePageLoad(url, `page:${path}`);
  }

  /**
   * Verify cart state after cart operations
   * @param {Object} expectedState - Expected cart state
   */
  async verifyCart(expectedState = {}) {
    // Navigate to cart page if not already there
    const currentPath = await this.getCurrentPath();
    if (currentPath !== '/cart') {
      await this.navigateTo('/cart');
    }
    
    // Get cart items from localStorage or mock
    const cartItems = await this.getCartFromLocalStorage();
    
    // Start soft assertions to collect all validation errors
    this.assert.startSoftAssertions();
    
    // Verify cart item count if specified
    if (expectedState.itemCount !== undefined) {
      const itemCount = cartItems.length;
      this.assert.assertEquals(
        itemCount, 
        expectedState.itemCount, 
        `Cart should contain ${expectedState.itemCount} items`
      );
    }
    
    // Verify specific products if specified
    if (expectedState.products) {
      for (const product of expectedState.products) {
        this.assert.assertCartContainsProduct(
          cartItems,
          product.id,
          product.quantity,
          `Cart should contain product ${product.id} with quantity ${product.quantity}`
        );
      }
    }
    
    // Verify subtotal if specified
    if (expectedState.subtotal !== undefined) {
      // Get subtotal from page
      const subtotalElement = await page.$('.cart-subtotal');
      if (subtotalElement) {
        const subtotalText = await page.evaluate(el => el.textContent, subtotalElement);
        const subtotal = parseFloat(subtotalText.replace(/[^0-9.]/g, ''));
        
        // Allow small floating point differences
        const difference = Math.abs(subtotal - expectedState.subtotal);
        this.assert.assertTrue(
          difference < 0.01,
          `Cart subtotal should be approximately ${expectedState.subtotal}`
        );
      }
    }
    
    // Verify all assertions
    return this.assert.verifySoftAssertions();
  }

  /**
   * Verify order confirmation after checkout
   * @param {Object} expectedOrder - Expected order details
   */
  async verifyOrderConfirmation(expectedOrder = {}) {
    // Wait for order confirmation page
    await this.wait.waitForElement('.order-confirmation');
    
    // Start soft assertions
    this.assert.startSoftAssertions();
    
    // Verify order ID is present
    const orderIdElement = await page.$('[data-testid="order-id"]');
    if (orderIdElement) {
      const orderId = await page.evaluate(el => el.textContent, orderIdElement);
      this.assert.assertTrue(orderId.trim().length > 0, 'Order ID should be present');
      
      if (expectedOrder.id) {
        this.assert.assertEquals(orderId.trim(), expectedOrder.id, 'Order ID should match expected');
      }
    }
    
    // Verify order total if specified
    if (expectedOrder.total !== undefined) {
      const totalElement = await page.$('[data-testid="order-total"]');
      if (totalElement) {
        const totalText = await page.evaluate(el => el.textContent, totalElement);
        const total = parseFloat(totalText.replace(/[^0-9.]/g, ''));
        
        // Allow small floating point differences
        const difference = Math.abs(total - expectedOrder.total);
        this.assert.assertTrue(
          difference < 0.01,
          `Order total should be approximately ${expectedOrder.total}`
        );
      }
    }
    
    // Verify shipping address if specified
    if (expectedOrder.shipping) {
      const addressElement = await page.$('[data-testid="shipping-address"]');
      if (addressElement) {
        const addressText = await page.evaluate(el => el.textContent, addressElement);
        
        this.assert.assertTrue(
          addressText.includes(expectedOrder.shipping.firstName),
          'Shipping address should contain first name'
        );
        
        this.assert.assertTrue(
          addressText.includes(expectedOrder.shipping.lastName),
          'Shipping address should contain last name'
        );
        
        this.assert.assertTrue(
          addressText.includes(expectedOrder.shipping.address),
          'Shipping address should contain street address'
        );
      }
    }
    
    // Verify all assertions
    return this.assert.verifySoftAssertions();
  }

  /**
   * Verify product details page
   * @param {Object} expectedProduct - Expected product details
   */
  async verifyProductDetails(expectedProduct) {
    // Wait for product details to load
    await this.wait.waitForElement('[data-testid="product-detail"]');
    
    // Start soft assertions
    this.assert.startSoftAssertions();
    
    // Verify product name
    if (expectedProduct.name) {
      const nameElement = await page.$('[data-testid="product-name"]');
      if (nameElement) {
        const name = await page.evaluate(el => el.textContent, nameElement);
        this.assert.assertEquals(name.trim(), expectedProduct.name, 'Product name should match');
      }
    }
    
    // Verify product price
    if (expectedProduct.price !== undefined) {
      const priceElement = await page.$('[data-testid="product-price"]');
      if (priceElement) {
        const priceText = await page.evaluate(el => el.textContent, priceElement);
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        
        // Allow small floating point differences
        const difference = Math.abs(price - expectedProduct.price);
        this.assert.assertTrue(
          difference < 0.01,
          `Product price should be approximately ${expectedProduct.price}`
        );
      }
    }
    
    // Verify product image
    if (expectedProduct.image) {
      const imageElement = await page.$('[data-testid="product-image"]');
      if (imageElement) {
        const src = await page.evaluate(el => el.getAttribute('src'), imageElement);
        this.assert.assertTrue(
          src.includes(expectedProduct.image),
          'Product image source should match expected'
        );
      }
    }
    
    // Verify product description
    if (expectedProduct.description) {
      const descriptionElement = await page.$('[data-testid="product-description"]');
      if (descriptionElement) {
        const description = await page.evaluate(el => el.textContent, descriptionElement);
        this.assert.assertTrue(
          description.includes(expectedProduct.description),
          'Product description should match expected'
        );
      }
    }
    
    // Verify all assertions
    return this.assert.verifySoftAssertions();
  }

  /**
   * Fill checkout form with shipping information
   * @param {Object} shippingInfo - Shipping information
   */
  async fillShippingInfo(shippingInfo) {
    // Wait for shipping form to be visible
    await this.wait.waitForElement('[data-testid="shipping-form"]');
    
    // Fill in the form fields
    await page.type('#firstName', shippingInfo.firstName);
    await page.type('#lastName', shippingInfo.lastName);
    await page.type('#address', shippingInfo.address);
    await page.type('#city', shippingInfo.city);
    await page.type('#state', shippingInfo.state);
    await page.type('#zipCode', shippingInfo.zipCode);
    await page.type('#phone', shippingInfo.phone);
    
    // Select country if dropdown exists
    const countrySelect = await page.$('#country');
    if (countrySelect) {
      await page.select('#country', shippingInfo.country);
    }
  }

  /**
   * Validate API response against schema
   * @param {Object} response - API response
   * @param {Object} schema - Expected schema
   * @returns {boolean} True if valid
   */
  validateApiResponse(response, schema) {
    // Start soft assertions
    this.assert.startSoftAssertions();
    
    // Check response status
    if (schema.status) {
      this.assert.assertEquals(
        response.status || response.statusCode,
        schema.status,
        `API response status should be ${schema.status}`
      );
    }
    
    // Check required fields
    if (schema.requiredFields && response.data) {
      for (const field of schema.requiredFields) {
        this.assert.assertHasProperty(
          response.data,
          field,
          `API response should have field "${field}"`
        );
      }
    }
    
    // Check field types
    if (schema.fieldTypes && response.data) {
      for (const [field, type] of Object.entries(schema.fieldTypes)) {
        if (response.data[field] !== undefined) {
          this.assert.assertTrue(
            typeof response.data[field] === type,
            `Field "${field}" should be of type ${type}`
          );
        }
      }
    }
    
    // Verify all assertions
    return this.assert.verifySoftAssertions();
  }
}

module.exports = EnhancedBaseTest;
