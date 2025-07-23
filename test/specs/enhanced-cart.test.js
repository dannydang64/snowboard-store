/**
 * Enhanced Shopping Cart Test Suite
 * Tests the shopping cart functionality of the Snow Ice e-commerce application
 * Implements best practices from the framework context
 */
const EnhancedBaseTest = require('../framework/EnhancedBaseTest');
const ProductDetailPage = require('../pages/ProductDetailPage');
const CartPage = require('../pages/CartPage');
const TestReporter = require('../utils/TestReporter');
const WaitHelper = require('../utils/WaitHelper');
const AssertionHelper = require('../utils/AssertionHelper');
const DataManager = require('../utils/DataManager');

describe('Enhanced Shopping Cart', () => {
  let test;
  let productDetailPage;
  let cartPage;
  let testInfo;

  beforeEach(async () => {
    test = new EnhancedBaseTest();
    productDetailPage = new ProductDetailPage();
    cartPage = new CartPage();
    
    // Setup test with performance monitoring
    await test.setup({ 
      navigateToHome: true,
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
    
    // Take screenshot if test failed
    if (testInfo.status === 'failed') {
      await test.takeScreenshot(testInfo.name.replace(/\s+/g, '-').toLowerCase());
    }
  });

  /**
   * Test: Add product to cart from product detail page
   * Priority: P0
   * 
   * This test verifies that users can add a product to their cart from
   * the product detail page. This is a critical user journey as it's the
   * primary way users begin the purchase process.
   */
  it('P0: Should add product to cart from product detail page', async () => {
    // Get test product data
    const testProduct = await DataManager.getProduct('sb-001');
    
    // Navigate to product detail page with performance monitoring
    await test.performance.measurePageLoad(
      `${test.baseUrl}/products/${testProduct.id}`,
      'productDetailPage'
    );
    
    // Wait for product details to load
    await WaitHelper.waitForElement('[data-testid="product-detail"]');
    
    // Get the initial cart count
    const initialCartCount = await productDetailPage.getCartCount();
    
    // Add the product to the cart
    await productDetailPage.addToCart();
    
    // Wait for cart update using explicit wait
    await WaitHelper.waitForCondition(async () => {
      const currentCount = await productDetailPage.getCartCount();
      return currentCount > initialCartCount;
    }, { 
      timeout: 5000,
      errorMessage: 'Cart count did not increase after adding product'
    });
    
    // Verify the cart count increased
    const updatedCartCount = await productDetailPage.getCartCount();
    AssertionHelper.assertEquals(
      updatedCartCount,
      initialCartCount + 1,
      'Cart count should increase by 1'
    );
    
    // Navigate to the cart page
    await cartPage.navigate();
    
    // Verify the cart using the enhanced verification method
    await test.verifyCart({
      itemCount: 1,
      products: [
        { id: testProduct.id, quantity: 1 }
      ]
    });
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_CART_001',
      testCaseName: 'Add product to cart from product detail page',
      description: 'Verifies that users can add a product to their cart from the product detail page',
      featureArea: 'Shopping Cart',
      priority: 'P0',
      testType: 'Positive',
      expectedResults: 'Product should be added to cart and cart count should increase',
      actualResults: 'Product was successfully added to cart and cart count increased',
      status: 'Pass',
      executionTime: testInfo.duration
    });
  });

  /**
   * Test: Update product quantity in cart
   * Priority: P0
   * 
   * This test verifies that users can update the quantity of products
   * in their cart. This is important for allowing users to adjust their
   * order before checkout.
   */
  it('P0: Should update product quantity in cart', async () => {
    // Get test product data
    const testProduct = await DataManager.getProduct('sb-001');
    
    // Add a product to the cart first
    await productDetailPage.navigateToProduct(testProduct.id);
    await productDetailPage.addToCart();
    
    // Navigate to the cart page
    await cartPage.navigate();
    
    // Start soft assertions
    AssertionHelper.startSoftAssertions();
    
    // Verify the product is in the cart with quantity 1
    const initialQuantity = await cartPage.getItemQuantity(0);
    AssertionHelper.assertEquals(initialQuantity, 1, 'Initial quantity should be 1');
    
    // Update the quantity to 3
    await cartPage.updateItemQuantity(0, 3);
    
    // Wait for quantity update using explicit wait
    await WaitHelper.waitForCondition(async () => {
      const currentQuantity = await cartPage.getItemQuantity(0);
      return currentQuantity === 3;
    }, { 
      timeout: 5000,
      errorMessage: 'Cart quantity was not updated to 3'
    });
    
    // Verify the quantity was updated
    const updatedQuantity = await cartPage.getItemQuantity(0);
    AssertionHelper.assertEquals(updatedQuantity, 3, 'Updated quantity should be 3');
    
    // Verify the subtotal was updated
    const subtotal = await cartPage.getSubtotal();
    
    // Get the product price
    const productPrice = testProduct.price;
    
    // Calculate expected subtotal (price * quantity)
    const expectedSubtotal = productPrice * 3;
    
    // Verify the subtotal is correct (allowing for small floating point differences)
    AssertionHelper.assertTrue(
      Math.abs(subtotal - expectedSubtotal) < 0.01,
      `Subtotal should be approximately ${expectedSubtotal}`
    );
    
    // Verify all assertions
    AssertionHelper.verifySoftAssertions();
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_CART_002',
      testCaseName: 'Update product quantity in cart',
      description: 'Verifies that users can update the quantity of products in their cart',
      featureArea: 'Shopping Cart',
      priority: 'P0',
      testType: 'Positive',
      expectedResults: 'Product quantity should be updated and subtotal should reflect the change',
      actualResults: 'Product quantity was updated and subtotal was correctly calculated',
      status: 'Pass',
      executionTime: testInfo.duration
    });
  });

  /**
   * Test: Remove product from cart
   * Priority: P0
   * 
   * This test verifies that users can remove products from their cart.
   * This is important for allowing users to change their mind before checkout.
   */
  it('P0: Should remove product from cart', async () => {
    // Get test product data
    const testProduct = await DataManager.getProduct('sb-001');
    
    // Add a product to the cart first
    await productDetailPage.navigateToProduct(testProduct.id);
    await productDetailPage.addToCart();
    
    // Navigate to the cart page
    await cartPage.navigate();
    
    // Verify the product is in the cart
    const initialItemCount = await cartPage.getItemCount();
    expect(initialItemCount).toBe(1);
    
    // Remove the product from the cart
    await cartPage.removeItem(0);
    
    // Wait for cart update using explicit wait
    await WaitHelper.waitForCondition(async () => {
      return await cartPage.isCartEmpty();
    }, { 
      timeout: 5000,
      errorMessage: 'Cart was not emptied after removing item'
    });
    
    // Verify the cart is empty
    const updatedItemCount = await cartPage.getItemCount();
    expect(updatedItemCount).toBe(0);
    
    // Verify the empty cart message is displayed
    const isCartEmpty = await cartPage.isCartEmpty();
    expect(isCartEmpty).toBe(true);
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_CART_003',
      testCaseName: 'Remove product from cart',
      description: 'Verifies that users can remove products from their cart',
      featureArea: 'Shopping Cart',
      priority: 'P0',
      testType: 'Positive',
      expectedResults: 'Product should be removed from cart and empty cart message should be displayed',
      actualResults: 'Product was removed from cart and empty cart message was displayed',
      status: 'Pass',
      executionTime: testInfo.duration
    });
  });

  /**
   * Test: Cart persists across page refreshes
   * Priority: P1
   * 
   * This test verifies that the cart contents persist when the user
   * refreshes the page. This is important for maintaining a good user
   * experience during the shopping process.
   */
  it('P1: Cart should persist across page refreshes', async () => {
    // Get test product data
    const testProduct = await DataManager.getProduct('sb-001');
    
    // Add a product to the cart
    await productDetailPage.navigateToProduct(testProduct.id);
    await productDetailPage.addToCart();
    
    // Navigate to the cart page
    await cartPage.navigate();
    
    // Verify the product is in the cart
    const initialItemCount = await cartPage.getItemCount();
    expect(initialItemCount).toBe(1);
    
    // Get initial product name for comparison
    const initialProductNames = await cartPage.getProductNames();
    
    // Refresh the page
    await page.reload();
    
    // Wait for page to load after refresh using explicit wait
    await WaitHelper.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Verify the product is still in the cart
    const updatedItemCount = await cartPage.getItemCount();
    expect(updatedItemCount).toBe(1);
    
    // Verify the product name is still correct
    const updatedProductNames = await cartPage.getProductNames();
    expect(updatedProductNames[0]).toBe(initialProductNames[0]);
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_CART_004',
      testCaseName: 'Cart persists across page refreshes',
      description: 'Verifies that the cart contents persist when the user refreshes the page',
      featureArea: 'Shopping Cart',
      priority: 'P1',
      testType: 'Positive',
      expectedResults: 'Cart contents should remain after page refresh',
      actualResults: 'Cart contents persisted after page refresh',
      status: 'Pass',
      executionTime: testInfo.duration
    });
  });

  /**
   * Test: Cart calculations are correct
   * Priority: P1
   * 
   * This test verifies that cart calculations (subtotal, tax, total)
   * are correct. This is important for ensuring users are charged correctly.
   */
  it('P1: Cart calculations should be correct', async () => {
    // Add multiple products to the cart
    const product1 = await DataManager.getProduct('sb-001');
    const product2 = await DataManager.getProduct('bd-001');
    
    // Add first product with quantity 2
    await productDetailPage.navigateToProduct(product1.id);
    await productDetailPage.setQuantity(2);
    await productDetailPage.addToCart();
    
    // Add second product with quantity 1
    await productDetailPage.navigateToProduct(product2.id);
    await productDetailPage.addToCart();
    
    // Navigate to the cart page
    await cartPage.navigate();
    
    // Start soft assertions
    AssertionHelper.startSoftAssertions();
    
    // Verify item count
    const itemCount = await cartPage.getItemCount();
    AssertionHelper.assertEquals(itemCount, 2, 'Cart should contain 2 items');
    
    // Calculate expected subtotal
    const expectedSubtotal = (product1.price * 2) + product2.price;
    
    // Get actual subtotal
    const subtotal = await cartPage.getSubtotal();
    
    // Verify subtotal (allowing for small floating point differences)
    AssertionHelper.assertTrue(
      Math.abs(subtotal - expectedSubtotal) < 0.01,
      `Subtotal should be approximately ${expectedSubtotal}`
    );
    
    // Get tax and total
    const tax = await cartPage.getTax();
    const total = await cartPage.getTotal();
    
    // Verify tax is a percentage of subtotal (assuming 8% tax rate)
    const expectedTax = expectedSubtotal * 0.08;
    AssertionHelper.assertTrue(
      Math.abs(tax - expectedTax) < 0.01,
      `Tax should be approximately ${expectedTax}`
    );
    
    // Verify total is sum of subtotal and tax
    const expectedTotal = expectedSubtotal + expectedTax;
    AssertionHelper.assertTrue(
      Math.abs(total - expectedTotal) < 0.01,
      `Total should be approximately ${expectedTotal}`
    );
    
    // Verify all assertions
    AssertionHelper.verifySoftAssertions();
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_CART_005',
      testCaseName: 'Cart calculations are correct',
      description: 'Verifies that cart calculations (subtotal, tax, total) are correct',
      featureArea: 'Shopping Cart',
      priority: 'P1',
      testType: 'Positive',
      expectedResults: 'Cart calculations should be mathematically correct',
      actualResults: 'Cart calculations were correct for subtotal, tax, and total',
      status: 'Pass',
      executionTime: testInfo.duration
    });
  });

  /**
   * Test: Add product with maximum quantity
   * Priority: P2
   * 
   * This test verifies that users can add a product with the maximum
   * allowed quantity. This tests boundary conditions.
   */
  it('P2: Should handle maximum product quantity', async () => {
    // Get test product data
    const testProduct = await DataManager.getProduct('sb-001');
    
    // Navigate to product detail page
    await productDetailPage.navigateToProduct(testProduct.id);
    
    // Set quantity to maximum allowed (assuming 10 is max)
    const maxQuantity = 10;
    await productDetailPage.setQuantity(maxQuantity);
    
    // Add to cart
    await productDetailPage.addToCart();
    
    // Navigate to cart page
    await cartPage.navigate();
    
    // Verify quantity in cart
    const cartQuantity = await cartPage.getItemQuantity(0);
    expect(cartQuantity).toBe(maxQuantity);
    
    // Try to increase quantity beyond maximum
    await cartPage.updateItemQuantity(0, maxQuantity + 5);
    
    // Wait for validation message or quantity to be capped
    await WaitHelper.waitForElement('.validation-message, .error-message');
    
    // Verify quantity is still at maximum or error message is shown
    const updatedQuantity = await cartPage.getItemQuantity(0);
    
    // Either quantity should be capped at max or error message should be displayed
    const validationMessageVisible = await page.$('.validation-message, .error-message') !== null;
    
    if (validationMessageVisible) {
      // If validation message is shown, quantity should remain unchanged
      expect(updatedQuantity).toBe(maxQuantity);
    } else {
      // If no validation message, quantity might be capped at maximum
      expect(updatedQuantity).toBeLessThanOrEqual(maxQuantity);
    }
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_CART_006',
      testCaseName: 'Handle maximum product quantity',
      description: 'Verifies that the application handles maximum product quantity correctly',
      featureArea: 'Shopping Cart',
      priority: 'P2',
      testType: 'Negative',
      expectedResults: 'Application should prevent or warn about exceeding maximum quantity',
      actualResults: 'Application correctly handled maximum quantity limits',
      status: 'Pass',
      executionTime: testInfo.duration
    });
  });

  /**
   * Test: Buy now functionality
   * Priority: P1
   * 
   * This test verifies that the "Buy Now" functionality works correctly,
   * allowing users to skip the cart and go directly to checkout.
   */
  it('P1: Buy now functionality should work correctly', async () => {
    // Get test product data
    const testProduct = await DataManager.getProduct('sb-001');
    
    // Navigate to product detail page
    await productDetailPage.navigateToProduct(testProduct.id);
    
    // Click Buy Now button
    await productDetailPage.clickBuyNow();
    
    // Wait for navigation to checkout page
    await WaitHelper.waitForNavigation();
    
    // Verify we're on the checkout page
    const currentUrl = await page.url();
    expect(currentUrl).toContain('/checkout');
    
    // Verify the product is in the checkout items
    const checkoutItems = await page.$$('.checkout-item');
    expect(checkoutItems.length).toBe(1);
    
    // Verify the product details in checkout
    const productName = await page.$eval('.checkout-item .product-name', el => el.textContent);
    expect(productName).toContain(testProduct.name);
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_CART_007',
      testCaseName: 'Buy now functionality',
      description: 'Verifies that the "Buy Now" functionality works correctly',
      featureArea: 'Shopping Cart',
      priority: 'P1',
      testType: 'Positive',
      expectedResults: 'User should be taken directly to checkout with the product',
      actualResults: 'Buy Now functionality correctly directed to checkout with product',
      status: 'Pass',
      executionTime: testInfo.duration
    });
  });
});
