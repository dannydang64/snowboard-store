const BaseTest = require('../framework/BaseTest');
const ProductDetailPage = require('../pages/ProductDetailPage');
const CartPage = require('../pages/CartPage');
const CheckoutPage = require('../pages/CheckoutPage');
const OrderConfirmationPage = require('../pages/OrderConfirmationPage');
const TestDataHelper = require('../utils/TestDataHelper');

/**
 * Test suite for checkout functionality
 */
describe('Checkout Process', () => {
  let baseTest;
  let productDetailPage;
  let cartPage;
  let checkoutPage;
  let orderConfirmationPage;
  let testDataHelper;
  let testCustomer;

  beforeEach(async () => {
    baseTest = new BaseTest();
    productDetailPage = new ProductDetailPage();
    cartPage = new CartPage();
    checkoutPage = new CheckoutPage();
    orderConfirmationPage = new OrderConfirmationPage();
    testDataHelper = new TestDataHelper();
    
    // Generate test customer data
    testCustomer = testDataHelper.generateCustomer();
    
    // Clear the cart before each test
    await baseTest.clearCart();
    
    // Add a product to the cart and navigate to checkout
    await productDetailPage.navigateToProduct('sb-001');
    await productDetailPage.addToCart();
  });

  /**
   * Test: Complete checkout process with valid information
   * Priority: P0
   * 
   * This test verifies that users can complete the checkout process
   * with valid shipping and payment information. This is a critical
   * user journey as it's how users make purchases.
   */
  test('P0: Should complete checkout process with valid information', async () => {
    // Navigate to the cart page
    await cartPage.navigate();
    
    // Verify the product is in the cart
    const itemCount = await cartPage.getItemCount();
    expect(itemCount).toBe(1);
    
    // Proceed to checkout
    await cartPage.proceedToCheckout();
    
    // Verify we're on the checkout page
    const currentUrl = await page.url();
    expect(currentUrl).toContain('/checkout');
    
    // Complete the checkout process
    const checkoutSuccess = await checkoutPage.completeCheckout(testCustomer);
    
    // Verify the order confirmation is displayed
    expect(checkoutSuccess).toBe(true);
    
    // Verify the order confirmation page has the expected elements
    const isOrderConfirmationDisplayed = await orderConfirmationPage.isOrderConfirmationDisplayed();
    expect(isOrderConfirmationDisplayed).toBe(true);
    
    // Verify the order number is displayed
    const orderNumber = await orderConfirmationPage.getOrderNumber();
    expect(orderNumber).toBeTruthy();
  });

  /**
   * Test: Validate shipping information form
   * Priority: P1
   * 
   * This test verifies that the shipping information form validates
   * required fields. This is important for ensuring users provide
   * all necessary information for shipping.
   */
  test('P1: Should validate shipping information form', async () => {
    // Navigate to the cart page and proceed to checkout
    await cartPage.navigate();
    await cartPage.proceedToCheckout();
    
    // Try to submit the form without filling in any fields
    await checkoutPage.submitShippingInformation();
    
    // Verify error messages are displayed
    const errorMessages = await checkoutPage.getErrorMessages();
    expect(errorMessages.length).toBeGreaterThan(0);
    
    // Fill in only some required fields
    await checkoutPage.fillShippingInformation({
      firstName: testCustomer.firstName,
      lastName: testCustomer.lastName
      // Missing other required fields
    });
    
    // Try to submit the form again
    await checkoutPage.submitShippingInformation();
    
    // Verify error messages are still displayed
    const updatedErrorMessages = await checkoutPage.getErrorMessages();
    expect(updatedErrorMessages.length).toBeGreaterThan(0);
    
    // Fill in all required fields
    await checkoutPage.fillShippingInformation(testCustomer);
    
    // Submit the form
    await checkoutPage.submitShippingInformation();
    
    // Verify we moved to the next step (payment)
    const activeStep = await checkoutPage.getActiveStep();
    expect(activeStep.toLowerCase()).toContain('payment');
  });

  /**
   * Test: Order summary shows correct information
   * Priority: P1
   * 
   * This test verifies that the order summary on the checkout page
   * shows the correct product information and pricing. This is important
   * for ensuring users know what they're purchasing.
   */
  test('P1: Order summary should show correct information', async () => {
    // Add multiple products to the cart
    await productDetailPage.navigateToProduct('sb-001');
    await productDetailPage.setQuantity(2);
    await productDetailPage.addToCart();
    
    await productDetailPage.navigateToProduct('bd-001');
    await productDetailPage.addToCart();
    
    // Navigate to the cart page and proceed to checkout
    await cartPage.navigate();
    await cartPage.proceedToCheckout();
    
    // Verify the order summary shows the correct number of items
    const orderItemCount = await checkoutPage.getOrderItemCount();
    expect(orderItemCount).toBe(2);
    
    // Verify the subtotal and total are displayed
    const subtotal = await checkoutPage.getSubtotal();
    const total = await checkoutPage.getTotal();
    
    expect(subtotal).toBeGreaterThan(0);
    expect(total).toBeGreaterThan(subtotal);
  });

  /**
   * Test: Cannot proceed to checkout with empty cart
   * Priority: P2
   * 
   * This test verifies that users cannot proceed to checkout with an
   * empty cart. This prevents users from creating empty orders.
   */
  test('P2: Should not proceed to checkout with empty cart', async () => {
    // Clear the cart
    await baseTest.clearCart();
    
    // Navigate to the cart page
    await cartPage.navigate();
    
    // Verify the cart is empty
    const isCartEmpty = await cartPage.isCartEmpty();
    expect(isCartEmpty).toBe(true);
    
    // Verify the checkout button is not displayed
    const checkoutButton = await page.$('a:contains("Proceed to Checkout")');
    expect(checkoutButton).toBeNull();
    
    // Try to navigate directly to the checkout page
    await checkoutPage.navigate();
    
    // Verify we're redirected back to the cart page
    const currentUrl = await page.url();
    expect(currentUrl).toContain('/cart');
  });

  /**
   * Test: Order confirmation page displays correct information
   * Priority: P1
   * 
   * This test verifies that the order confirmation page displays
   * the correct order information. This is important for providing
   * users with confirmation of their purchase.
   */
  test('P1: Order confirmation page should display correct information', async () => {
    // Navigate to the cart page and proceed to checkout
    await cartPage.navigate();
    await cartPage.proceedToCheckout();
    
    // Complete the checkout process
    await checkoutPage.completeCheckout(testCustomer);
    
    // Verify the order confirmation is displayed
    const isOrderConfirmationDisplayed = await orderConfirmationPage.isDisplayed();
    expect(isOrderConfirmationDisplayed).toBe(true);
    
    // Verify the order number is displayed
    const orderNumber = await orderConfirmationPage.getOrderNumber();
    expect(orderNumber).toBeTruthy();
    
    // Verify the order status is displayed
    const orderStatus = await orderConfirmationPage.getOrderStatus();
    expect(orderStatus).toBeTruthy();
    
    // Verify the shipping address contains the customer's information
    const shippingAddress = await orderConfirmationPage.getShippingAddress();
    expect(shippingAddress).toContain(testCustomer.firstName);
    expect(shippingAddress).toContain(testCustomer.lastName);
    
    // Verify the order total matches the cart total
    const orderTotal = await orderConfirmationPage.getOrderTotal();
    expect(orderTotal).toBeGreaterThan(0);
    
    // Verify the continue shopping button is displayed
    const continueShoppingButton = await page.$('a:contains("Continue Shopping")');
    expect(continueShoppingButton).not.toBeNull();
  });

  /**
   * Test: Checkout with multiple products
   * Priority: P1
   * 
   * This test verifies that users can checkout with multiple products
   * in their cart. This is important for ensuring the checkout process
   * works with various cart configurations.
   */
  test('P1: Should checkout with multiple products', async () => {
    // Clear the cart first
    await baseTest.clearCart();
    
    // Add multiple products to the cart
    await productDetailPage.navigateToProduct('sb-001');
    await productDetailPage.addToCart();
    
    await productDetailPage.navigateToProduct('bd-001');
    await productDetailPage.addToCart();
    
    await productDetailPage.navigateToProduct('bt-001');
    await productDetailPage.addToCart();
    
    // Navigate to the cart page
    await cartPage.navigate();
    
    // Verify all products are in the cart
    const itemCount = await cartPage.getItemCount();
    expect(itemCount).toBe(3);
    
    // Proceed to checkout
    await cartPage.proceedToCheckout();
    
    // Complete the checkout process
    const checkoutSuccess = await checkoutPage.completeCheckout(testCustomer);
    
    // Verify the order confirmation is displayed
    expect(checkoutSuccess).toBe(true);
    
    // Verify the order confirmation shows the correct number of items
    const orderItemCount = await orderConfirmationPage.getOrderItemCount();
    expect(orderItemCount).toBe(3);
  });

  /**
   * Test: Invalid payment information is rejected
   * Priority: P1
   * 
   * This test verifies that the checkout process rejects invalid
   * payment information. This is important for preventing fraudulent
   * or incorrect payments.
   */
  test('P1: Should reject invalid payment information', async () => {
    // Navigate to the cart page and proceed to checkout
    await cartPage.navigate();
    await cartPage.proceedToCheckout();
    
    // Fill in shipping information
    await checkoutPage.fillShippingInformation(testCustomer);
    await checkoutPage.submitShippingInformation();
    
    // Fill in invalid payment information
    await checkoutPage.fillPaymentInformation({
      cardName: 'Test User',
      cardNumber: '1234', // Invalid card number
      expiry: '00/00', // Invalid expiry
      cvv: 'abc' // Invalid CVV
    });
    
    // Try to place the order
    await page.click('button:contains("Place Order")');
    
    // Verify error messages are displayed
    const errorMessages = await checkoutPage.getErrorMessages();
    expect(errorMessages.length).toBeGreaterThan(0);
    
    // Verify we're still on the checkout page
    const currentUrl = await page.url();
    expect(currentUrl).toContain('/checkout');
  });
});
