/**
 * API Endpoints Test Suite
 * Tests the REST API endpoints of the Snow Ice e-commerce application
 * Covers products, cart, and orders APIs with comprehensive validation
 */
const EnhancedBaseTest = require('../framework/EnhancedBaseTest');
const ApiHelper = require('../utils/ApiHelper');
const TestReporter = require('../utils/TestReporter');
const PerformanceMonitor = require('../utils/PerformanceMonitor');
const AssertionHelper = require('../utils/AssertionHelper');
const DataManager = require('../utils/DataManager');
const TestConfig = require('../framework/TestConfig');

describe('API Endpoints', () => {
  let test;
  let apiHelper;
  let testInfo;

  beforeEach(async () => {
    test = new EnhancedBaseTest();
    apiHelper = new ApiHelper();
    
    // Setup test with performance monitoring
    await test.setup({ 
      monitorPerformance: true
    });
    
    // Store test information for reporting
    testInfo = {
      name: expect.getState().currentTestName,
      startTime: Date.now()
    };
  });

  afterEach(async () => {
    // Teardown test
    await test.teardown();
    
    // Update test information for reporting
    testInfo.endTime = Date.now();
    testInfo.duration = testInfo.endTime - testInfo.startTime;
    testInfo.status = expect.getState().currentTestName.includes('FAILED') ? 'failed' : 'passed';
  });

  /**
   * Test: Products API returns correct data
   * Priority: P0
   * 
   * This test verifies that the products API returns the correct data
   * and structure. This is critical for the product browsing functionality.
   */
  it('P0: Products API should return correct data', async () => {
    // Measure API response time
    const { response, metric } = await PerformanceMonitor.measureApiCall(
      'getProducts',
      () => apiHelper.getAllProducts()
    );
    
    // Start soft assertions
    AssertionHelper.startSoftAssertions();
    
    // Verify response status
    AssertionHelper.assertEquals(response.status, 200, 'API response status should be 200');
    
    // Verify response has products array
    AssertionHelper.assertTrue(
      Array.isArray(response.data), 
      'API response should contain an array of products'
    );
    
    // Verify products have required fields
    if (response.data.length > 0) {
      const product = response.data[0];
      AssertionHelper.assertHasProperty(product, 'id', 'Product should have ID');
      AssertionHelper.assertHasProperty(product, 'name', 'Product should have name');
      AssertionHelper.assertHasProperty(product, 'price', 'Product should have price');
      AssertionHelper.assertHasProperty(product, 'category', 'Product should have category');
    }
    
    // Verify response time is within threshold
    if (metric) {
      AssertionHelper.assertLessThan(
        metric.duration,
        TestConfig.get('reporting.performanceThresholds.apiResponse'),
        'API response time should be within threshold'
      );
    }
    
    // Verify all assertions
    AssertionHelper.verifySoftAssertions();
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_API_001',
      testCaseName: 'Products API returns correct data',
      description: 'Verifies that the products API returns the correct data structure',
      featureArea: 'API',
      priority: 'P0',
      testType: 'Positive',
      expectedResults: 'API should return products with correct structure',
      actualResults: 'API returned products with correct structure',
      status: 'Pass',
      executionTime: metric ? metric.duration : 0
    });
  });

  /**
   * Test: Products API filters by category
   * Priority: P1
   * 
   * This test verifies that the products API correctly filters products
   * by category. This is important for the category browsing functionality.
   */
  it('P1: Products API should filter by category', async () => {
    const category = 'snowboards';
    
    // Measure API response time
    const { response, metric } = await PerformanceMonitor.measureApiCall(
      'getProductsByCategory',
      () => apiHelper.getProductsByCategory(category)
    );
    
    // Start soft assertions
    AssertionHelper.startSoftAssertions();
    
    // Verify response status
    AssertionHelper.assertEquals(response.status, 200, 'API response status should be 200');
    
    // Verify response has products array
    AssertionHelper.assertTrue(
      Array.isArray(response.data), 
      'API response should contain an array of products'
    );
    
    // Verify all products are in the requested category
    if (response.data.length > 0) {
      const allInCategory = response.data.every(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
      
      AssertionHelper.assertTrue(
        allInCategory,
        `All products should be in the ${category} category`
      );
    }
    
    // Verify response time is within threshold
    if (metric) {
      AssertionHelper.assertLessThan(
        metric.duration,
        TestConfig.get('reporting.performanceThresholds.apiResponse'),
        'API response time should be within threshold'
      );
    }
    
    // Verify all assertions
    AssertionHelper.verifySoftAssertions();
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_API_002',
      testCaseName: 'Products API filters by category',
      description: 'Verifies that the products API correctly filters products by category',
      featureArea: 'API',
      priority: 'P1',
      testType: 'Positive',
      expectedResults: 'API should return only products in the specified category',
      actualResults: 'API returned products filtered by category correctly',
      status: 'Pass',
      executionTime: metric ? metric.duration : 0
    });
  });

  /**
   * Test: Cart API supports CRUD operations
   * Priority: P0
   * 
   * This test verifies that the cart API supports all CRUD operations
   * (Create, Read, Update, Delete). This is critical for the shopping cart functionality.
   */
  it('P0: Cart API should support CRUD operations', async () => {
    // Get test product data
    const testProduct = await DataManager.getProduct('sb-001');
    
    // Create a new cart
    const { response: createResponse } = await PerformanceMonitor.measureApiCall(
      'createCart',
      () => apiHelper.getCart(null)
    );
    
    // Verify cart creation
    expect(createResponse.status).toBe(200);
    expect(createResponse.data).toHaveProperty('cartId');
    expect(createResponse.data).toHaveProperty('items');
    expect(createResponse.data.items).toHaveLength(0);
    
    const cartId = createResponse.data.cartId;
    
    // Add item to cart
    const { response: addResponse } = await PerformanceMonitor.measureApiCall(
      'addToCart',
      () => apiHelper.addToCart({
        cartId,
        productId: testProduct.id,
        quantity: 2
      })
    );
    
    // Verify item addition
    expect(addResponse.status).toBe(200);
    expect(addResponse.data).toHaveProperty('cartId', cartId);
    expect(addResponse.data).toHaveProperty('items');
    expect(addResponse.data.items).toHaveLength(1);
    expect(addResponse.data.items[0]).toHaveProperty('productId', testProduct.id);
    expect(addResponse.data.items[0]).toHaveProperty('quantity', 2);
    
    // Get cart
    const { response: getResponse } = await PerformanceMonitor.measureApiCall(
      'getCart',
      () => apiHelper.getCart(cartId)
    );
    
    // Verify get cart
    expect(getResponse.status).toBe(200);
    expect(getResponse.data).toHaveProperty('cartId', cartId);
    expect(getResponse.data).toHaveProperty('items');
    expect(getResponse.data.items).toHaveLength(1);
    
    // Update item quantity
    const { response: updateResponse } = await PerformanceMonitor.measureApiCall(
      'updateCartItem',
      () => apiHelper.updateCartItem({
        cartId,
        productId: testProduct.id,
        quantity: 3
      })
    );
    
    // Verify item update
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.items[0]).toHaveProperty('quantity', 3);
    
    // Remove item from cart
    const { response: removeResponse } = await PerformanceMonitor.measureApiCall(
      'removeFromCart',
      () => apiHelper.removeFromCart({
        cartId,
        productId: testProduct.id
      })
    );
    
    // Verify item removal
    expect(removeResponse.status).toBe(200);
    expect(removeResponse.data.items).toHaveLength(0);
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_API_003',
      testCaseName: 'Cart API supports CRUD operations',
      description: 'Verifies that the cart API supports all CRUD operations',
      featureArea: 'API',
      priority: 'P0',
      testType: 'Positive',
      expectedResults: 'API should support creating, reading, updating, and deleting cart items',
      actualResults: 'API successfully performed all CRUD operations',
      status: 'Pass',
      executionTime: testInfo.duration
    });
  });

  /**
   * Test: Orders API creates and retrieves orders
   * Priority: P0
   * 
   * This test verifies that the orders API can create new orders
   * and retrieve existing orders. This is critical for the checkout functionality.
   */
  it('P0: Orders API should create and retrieve orders', async () => {
    // Get test product data
    const testProduct = await DataManager.getProduct('sb-001');
    
    // Create a new cart and add an item
    const { response: cartResponse } = await PerformanceMonitor.measureApiCall(
      'createCartWithItem',
      async () => {
        const cart = await apiHelper.getCart(null);
        await apiHelper.addToCart({
          cartId: cart.data.cartId,
          productId: testProduct.id,
          quantity: 1
        });
        return cart;
      }
    );
    
    const cartId = cartResponse.data.cartId;
    
    // Get shipping information
    const shippingInfo = await DataManager.getShippingInfo('valid');
    
    // Create an order
    const { response: createOrderResponse } = await PerformanceMonitor.measureApiCall(
      'createOrder',
      () => apiHelper.createOrder({
        cartId,
        shippingInfo
      })
    );
    
    // Verify order creation
    expect(createOrderResponse.status).toBe(200);
    expect(createOrderResponse.data).toHaveProperty('orderId');
    expect(createOrderResponse.data).toHaveProperty('status', 'pending');
    
    const orderId = createOrderResponse.data.orderId;
    
    // Get order details
    const { response: getOrderResponse } = await PerformanceMonitor.measureApiCall(
      'getOrder',
      () => apiHelper.getOrder(orderId)
    );
    
    // Verify get order
    expect(getOrderResponse.status).toBe(200);
    expect(getOrderResponse.data).toHaveProperty('orderId', orderId);
    expect(getOrderResponse.data).toHaveProperty('items');
    expect(getOrderResponse.data).toHaveProperty('shippingInfo');
    expect(getOrderResponse.data.shippingInfo).toHaveProperty('firstName', shippingInfo.firstName);
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_API_004',
      testCaseName: 'Orders API creates and retrieves orders',
      description: 'Verifies that the orders API can create and retrieve orders',
      featureArea: 'API',
      priority: 'P0',
      testType: 'Positive',
      expectedResults: 'API should create orders and retrieve order details',
      actualResults: 'API successfully created and retrieved order details',
      status: 'Pass',
      executionTime: testInfo.duration
    });
  });

  /**
   * Test: API should handle errors correctly
   * Priority: P1
   * 
   * This test verifies that the API handles errors correctly,
   * returning appropriate status codes and error messages.
   */
  it('P1: API should handle errors correctly', async () => {
    // Test invalid product ID
    const { response: invalidProductResponse } = await PerformanceMonitor.measureApiCall(
      'getInvalidProduct',
      () => apiHelper.getProductById('invalid-product-id')
    );
    
    // Verify error response
    expect(invalidProductResponse.status).toBe(404);
    expect(invalidProductResponse.data).toHaveProperty('error');
    
    // Test invalid cart ID
    const { response: invalidCartResponse } = await PerformanceMonitor.measureApiCall(
      'getInvalidCart',
      () => apiHelper.getCart('invalid-cart-id')
    );
    
    // Verify error response
    expect(invalidCartResponse.status).toBe(404);
    expect(invalidCartResponse.data).toHaveProperty('error');
    
    // Test invalid order ID
    const { response: invalidOrderResponse } = await PerformanceMonitor.measureApiCall(
      'getInvalidOrder',
      () => apiHelper.getOrder('invalid-order-id')
    );
    
    // Verify error response
    expect(invalidOrderResponse.status).toBe(404);
    expect(invalidOrderResponse.data).toHaveProperty('error');
    
    // Test missing required fields
    const { response: missingFieldsResponse } = await PerformanceMonitor.measureApiCall(
      'createOrderMissingFields',
      () => apiHelper.createOrder({
        // Missing cartId
        shippingInfo: {}
      })
    );
    
    // Verify error response
    expect(missingFieldsResponse.status).toBe(400);
    expect(missingFieldsResponse.data).toHaveProperty('error');
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_API_005',
      testCaseName: 'API handles errors correctly',
      description: 'Verifies that the API handles errors correctly',
      featureArea: 'API',
      priority: 'P1',
      testType: 'Negative',
      expectedResults: 'API should return appropriate status codes and error messages',
      actualResults: 'API returned correct error responses for invalid requests',
      status: 'Pass',
      executionTime: testInfo.duration
    });
  });

  /**
   * Test: API response times meet performance thresholds
   * Priority: P1
   * 
   * This test verifies that API response times meet the defined
   * performance thresholds. This is important for ensuring a good user experience.
   */
  it('P1: API response times should meet performance thresholds', async () => {
    const apiThreshold = TestConfig.get('reporting.performanceThresholds.apiResponse');
    const performanceResults = [];
    
    // Test products API performance
    const { response: productsResponse, metric: productsMetric } = await PerformanceMonitor.measureApiCall(
      'getProducts',
      () => apiHelper.getAllProducts()
    );
    
    performanceResults.push({
      name: 'Get Products',
      duration: productsMetric.duration,
      threshold: apiThreshold,
      passed: productsMetric.duration <= apiThreshold
    });
    
    // Test product details API performance
    const { response: productDetailsResponse, metric: productDetailsMetric } = await PerformanceMonitor.measureApiCall(
      'getProductDetails',
      () => apiHelper.getProductById('sb-001')
    );
    
    performanceResults.push({
      name: 'Get Product Details',
      duration: productDetailsMetric.duration,
      threshold: apiThreshold,
      passed: productDetailsMetric.duration <= apiThreshold
    });
    
    // Test cart API performance
    const { response: cartResponse, metric: cartMetric } = await PerformanceMonitor.measureApiCall(
      'createCart',
      () => apiHelper.getCart(null)
    );
    
    performanceResults.push({
      name: 'Create Cart',
      duration: cartMetric.duration,
      threshold: apiThreshold,
      passed: cartMetric.duration <= apiThreshold
    });
    
    // Test add to cart API performance
    const { metric: addToCartMetric } = await PerformanceMonitor.measureApiCall(
      'addToCart',
      () => apiHelper.addToCart({
        cartId: cartResponse.data.cartId,
        productId: 'sb-001',
        quantity: 1
      })
    );
    
    performanceResults.push({
      name: 'Add to Cart',
      duration: addToCartMetric.duration,
      threshold: apiThreshold,
      passed: addToCartMetric.duration <= apiThreshold
    });
    
    // Verify all API calls meet performance thresholds
    const failedCalls = performanceResults.filter(result => !result.passed);
    
    if (failedCalls.length > 0) {
      const failureMessages = failedCalls.map(result => 
        `${result.name} took ${result.duration.toFixed(2)}ms, exceeding threshold of ${result.threshold}ms`
      ).join('\n');
      
      fail(`API performance thresholds exceeded:\n${failureMessages}`);
    }
    
    // Record test result
    const allPassed = failedCalls.length === 0;
    
    TestReporter.recordTestResult({
      testCaseId: 'TC_API_006',
      testCaseName: 'API response times meet performance thresholds',
      description: 'Verifies that API response times meet the defined performance thresholds',
      featureArea: 'API',
      priority: 'P1',
      testType: 'Positive',
      expectedResults: `All API calls should respond within ${apiThreshold}ms`,
      actualResults: allPassed 
        ? 'All API calls met performance thresholds' 
        : `${failedCalls.length} API calls exceeded performance thresholds`,
      status: allPassed ? 'Pass' : 'Fail',
      executionTime: testInfo.duration,
      potentialRootCause: allPassed ? '' : 'API endpoints may need optimization'
    });
  });
});
