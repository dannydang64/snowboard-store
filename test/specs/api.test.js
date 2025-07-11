const ApiHelper = require('../utils/ApiHelper');
const TestDataHelper = require('../utils/TestDataHelper');

/**
 * Test suite for API endpoints
 */
describe('API Endpoints', () => {
  let apiHelper;
  let testDataHelper;
  let testCartId;

  beforeAll(async () => {
    apiHelper = new ApiHelper();
    testDataHelper = new TestDataHelper();
    
    // Create a test cart to use for all tests
    const cartResponse = await apiHelper.getCart(null);
    testCartId = cartResponse.cartId;
  });

  /**
   * Test: Products API returns correct data
   * Priority: P0
   * 
   * This test verifies that the products API returns the correct data
   * for all products, filtered products, and individual products.
   * This is critical for ensuring the product data layer works correctly.
   */
  test('P0: Products API should return correct data', async () => {
    // Get all products
    const allProducts = await apiHelper.getProducts();
    expect(Array.isArray(allProducts)).toBe(true);
    expect(allProducts.length).toBeGreaterThan(0);
    
    // Verify product structure
    const firstProduct = allProducts[0];
    expect(firstProduct).toHaveProperty('id');
    expect(firstProduct).toHaveProperty('name');
    expect(firstProduct).toHaveProperty('price');
    expect(firstProduct).toHaveProperty('category');
    
    // Get products by category
    const category = 'snowboards';
    const categoryProducts = await apiHelper.getProductsByCategory(category);
    expect(Array.isArray(categoryProducts)).toBe(true);
    expect(categoryProducts.length).toBeGreaterThan(0);
    
    // Verify all returned products are in the correct category
    for (const product of categoryProducts) {
      expect(product.category).toBe(category);
    }
    
    // Get a specific product by ID
    const productId = categoryProducts[0].id;
    const singleProduct = await apiHelper.getProductById(productId);
    expect(singleProduct).toHaveProperty('id', productId);
  });

  /**
   * Test: Cart API CRUD operations
   * Priority: P0
   * 
   * This test verifies that the cart API supports all CRUD operations:
   * creating a cart, adding items, updating items, and removing items.
   * This is critical for ensuring the cart functionality works correctly.
   */
  test('P0: Cart API should support CRUD operations', async () => {
    // Add an item to the cart
    const addItemResponse = await apiHelper.addToCart({
      cartId: testCartId,
      productId: 'sb-001',
      quantity: 2
    });
    
    expect(addItemResponse).toHaveProperty('cartId', testCartId);
    expect(addItemResponse).toHaveProperty('items');
    expect(addItemResponse.items).toHaveLength(1);
    expect(addItemResponse.items[0]).toHaveProperty('productId', 'sb-001');
    expect(addItemResponse.items[0]).toHaveProperty('quantity', 2);
    
    // Update the item quantity
    const updateItemResponse = await apiHelper.updateCartItem({
      cartId: testCartId,
      productId: 'sb-001',
      quantity: 3
    });
    
    expect(updateItemResponse).toHaveProperty('cartId', testCartId);
    expect(updateItemResponse).toHaveProperty('items');
    expect(updateItemResponse.items).toHaveLength(1);
    expect(updateItemResponse.items[0]).toHaveProperty('productId', 'sb-001');
    expect(updateItemResponse.items[0]).toHaveProperty('quantity', 3);
    
    // Add another item to the cart
    const addSecondItemResponse = await apiHelper.addToCart({
      cartId: testCartId,
      productId: 'bd-001',
      quantity: 1
    });
    
    expect(addSecondItemResponse).toHaveProperty('cartId', testCartId);
    expect(addSecondItemResponse).toHaveProperty('items');
    expect(addSecondItemResponse.items).toHaveLength(2);
    
    // Get the cart contents
    const getCartResponse = await apiHelper.getCart(testCartId);
    expect(getCartResponse).toHaveProperty('cartId', testCartId);
    expect(getCartResponse).toHaveProperty('items');
    expect(getCartResponse.items).toHaveLength(2);
    
    // Remove an item from the cart
    const removeItemResponse = await apiHelper.removeFromCart(testCartId, 'sb-001');
    expect(removeItemResponse).toHaveProperty('cartId', testCartId);
    expect(removeItemResponse).toHaveProperty('items');
    expect(removeItemResponse.items).toHaveLength(1);
    expect(removeItemResponse.items[0]).toHaveProperty('productId', 'bd-001');
    
    // Remove the second item from the cart
    const removeSecondItemResponse = await apiHelper.removeFromCart(testCartId, 'bd-001');
    expect(removeSecondItemResponse).toHaveProperty('cartId', testCartId);
    expect(removeSecondItemResponse).toHaveProperty('items');
    expect(removeSecondItemResponse.items).toHaveLength(0);
  });

  /**
   * Test: Orders API create and retrieve
   * Priority: P0
   * 
   * This test verifies that the orders API can create new orders and
   * retrieve existing orders. This is critical for ensuring the order
   * management functionality works correctly.
   */
  test('P0: Orders API should create and retrieve orders', async () => {
    // Generate test customer and order data
    const testCustomer = testDataHelper.generateCustomer();
    const testOrder = testDataHelper.generateOrder(testCustomer, 2);
    
    // Create a new order
    const createOrderResponse = await apiHelper.createOrder(testOrder);
    expect(createOrderResponse).toHaveProperty('success', true);
    expect(createOrderResponse).toHaveProperty('order');
    expect(createOrderResponse.order).toHaveProperty('orderId');
    
    const orderId = createOrderResponse.order.orderId;
    
    // Get the order by ID
    const getOrderResponse = await apiHelper.getOrders(orderId);
    expect(getOrderResponse).toHaveProperty('orderId', orderId);
    expect(getOrderResponse).toHaveProperty('customer');
    expect(getOrderResponse).toHaveProperty('items');
    expect(getOrderResponse).toHaveProperty('status', 'processing');
    
    // Verify customer information
    expect(getOrderResponse.customer).toHaveProperty('firstName', testCustomer.firstName);
    expect(getOrderResponse.customer).toHaveProperty('lastName', testCustomer.lastName);
    expect(getOrderResponse.customer).toHaveProperty('email', testCustomer.email);
    
    // Verify order items
    expect(getOrderResponse.items).toHaveLength(2);
  });

  /**
   * Test: Orders API update status
   * Priority: P1
   * 
   * This test verifies that the orders API can update the status of
   * existing orders. This is important for order management.
   */
  test('P1: Orders API should update order status', async () => {
    // Generate test customer and order data
    const testCustomer = testDataHelper.generateCustomer();
    const testOrder = testDataHelper.generateOrder(testCustomer, 1);
    
    // Create a new order
    const createOrderResponse = await apiHelper.createOrder(testOrder);
    const orderId = createOrderResponse.order.orderId;
    
    // Update the order status to "shipped"
    const updateStatusResponse = await apiHelper.updateOrderStatus(orderId, 'shipped');
    expect(updateStatusResponse).toHaveProperty('success', true);
    expect(updateStatusResponse).toHaveProperty('order');
    expect(updateStatusResponse.order).toHaveProperty('status', 'shipped');
    
    // Get the order to verify the status was updated
    const getOrderResponse = await apiHelper.getOrders(orderId);
    expect(getOrderResponse).toHaveProperty('status', 'shipped');
  });

  /**
   * Test: API error handling
   * Priority: P1
   * 
   * This test verifies that the API endpoints handle errors correctly.
   * This is important for ensuring the API is robust and provides
   * meaningful error messages.
   */
  test('P1: API should handle errors correctly', async () => {
    // Test product not found
    try {
      await apiHelper.getProductById('non-existent-id');
      // If we get here, the test failed
      fail('Expected API to throw an error for non-existent product');
    } catch (error) {
      expect(error.status).toBe(404);
      expect(error.message).toBe('Product not found');
    }
    
    // Test cart not found
    try {
      await apiHelper.getCart('non-existent-cart-id');
      // If we get here, the test failed
      fail('Expected API to throw an error for non-existent cart');
    } catch (error) {
      expect(error.status).toBe(404);
      expect(error.message).toBe('Cart not found');
    }
    
    // Test order not found
    try {
      await apiHelper.getOrders('non-existent-order-id');
      // If we get here, the test failed
      fail('Expected API to throw an error for non-existent order');
    } catch (error) {
      expect(error.status).toBe(404);
      expect(error.message).toBe('Order not found');
    }
    
    // Test invalid order status
    try {
      // Create a test order first
      const testCustomer = testDataHelper.generateCustomer();
      const testOrder = testDataHelper.generateOrder(testCustomer, 1);
      const createOrderResponse = await apiHelper.createOrder(testOrder);
      // Check if we have the expected response structure
      const orderId = createOrderResponse.order ? createOrderResponse.order.orderId : createOrderResponse.orderId;
      
      // Try to update with an invalid status
      await apiHelper.updateOrderStatus(orderId, 'invalid-status');
      
      // If we get here, the test failed
      fail('Expected API to throw an error for invalid order status');
    } catch (error) {
      expect(error.status).toBe(400);
      expect(error.message).toBe('Invalid status');
    }
  });

  /**
   * Test: API performance
   * Priority: P2
   * 
   * This test verifies that the API endpoints respond within an acceptable
   * time frame. This is important for ensuring a good user experience.
   */
  test('P2: API should respond within acceptable time', async () => {
    // Test products API response time
    const productsStartTime = Date.now();
    await apiHelper.getProducts();
    const productsEndTime = Date.now();
    const productsResponseTime = productsEndTime - productsStartTime;
    
    // Products API should respond within 500ms
    expect(productsResponseTime).toBeLessThan(500);
    
    // Test cart API response time
    const cartStartTime = Date.now();
    await apiHelper.getCart(testCartId);
    const cartEndTime = Date.now();
    const cartResponseTime = cartEndTime - cartStartTime;
    
    // Cart API should respond within 300ms
    expect(cartResponseTime).toBeLessThan(300);
    
    // Test orders API response time
    const ordersStartTime = Date.now();
    await apiHelper.getOrders();
    const ordersEndTime = Date.now();
    const ordersResponseTime = ordersEndTime - ordersStartTime;
    
    // Orders API should respond within 500ms
    expect(ordersResponseTime).toBeLessThan(500);
  });
});
