const BaseTest = require('../framework/BaseTest');
const ProductDetailPage = require('../pages/ProductDetailPage');
const CartPage = require('../pages/CartPage');
const ApiHelper = require('../utils/ApiHelper');
const TestDataHelper = require('../utils/TestDataHelper');

/**
 * Test suite for shopping cart functionality
 */
describe('Shopping Cart', () => {
  let baseTest;
  let productDetailPage;
  let cartPage;
  let apiHelper;
  let testDataHelper;

  beforeEach(async () => {
    baseTest = new BaseTest();
    productDetailPage = new ProductDetailPage();
    cartPage = new CartPage();
    apiHelper = new ApiHelper();
    testDataHelper = new TestDataHelper();

    // Clear the cart before each test
    await baseTest.clearCart();
    
    // In mock mode, set the URL to the cart page
    if (global.testConfig.testMode === 'mock') {
      global.mockDataStore.setCurrentUrl('http://localhost:3000/cart');
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
  test('P0: Should add product to cart from product detail page', async () => {
    // Navigate to a product detail page
    await productDetailPage.navigateToProduct('sb-001');
    
    // Get the initial cart count
    const initialCartCount = await productDetailPage.getCartCount();
    
    // Add the product to the cart
    await productDetailPage.addToCart();
    
    // Verify the cart count increased
    const updatedCartCount = await productDetailPage.getCartCount();
    expect(updatedCartCount).toBe(initialCartCount + 1);
    
    // Navigate to the cart page
    await cartPage.navigate();
    
    // Verify the product is in the cart
    const itemCount = await cartPage.getItemCount();
    expect(itemCount).toBe(1);
    
    // Verify the product name
    const productNames = await cartPage.getProductNames();
    expect(productNames[0]).toContain('Alpine Freestyle Snowboard');
  });

  /**
   * Test: Update product quantity in cart
   * Priority: P0
   * 
   * This test verifies that users can update the quantity of products
   * in their cart. This is important for allowing users to adjust their
   * order before checkout.
   */
  test('P0: Should update product quantity in cart', async () => {
    // Add a product to the cart first
    await productDetailPage.navigateToProduct('sb-001');
    await productDetailPage.addToCart();
    
    // Navigate to the cart page
    await cartPage.navigate();
    
    // Verify the product is in the cart with quantity 1
    const initialQuantity = await cartPage.getItemQuantity(0);
    expect(initialQuantity).toBe(1);
    
    // Update the quantity to 3
    await cartPage.updateItemQuantity(0, 3);
    
    // Verify the quantity was updated
    const updatedQuantity = await cartPage.getItemQuantity(0);
    expect(updatedQuantity).toBe(3);
    
    // Verify the subtotal was updated
    const subtotal = await cartPage.getSubtotal();
    
    // Get the product price from the product detail page
    await productDetailPage.navigateToProduct('sb-001');
    const productPrice = await productDetailPage.getProductPrice();
    
    // Calculate expected subtotal (price * quantity)
    const expectedSubtotal = productPrice * 3;
    
    // Verify the subtotal is correct (allowing for small floating point differences)
    expect(Math.abs(subtotal - expectedSubtotal)).toBeLessThan(0.01);
  });

  /**
   * Test: Remove product from cart
   * Priority: P0
   * 
   * This test verifies that users can remove products from their cart.
   * This is important for allowing users to change their mind before checkout.
   */
  test('P0: Should remove product from cart', async () => {
    // Add a product to the cart first
    await productDetailPage.navigateToProduct('sb-001');
    await productDetailPage.addToCart();
    
    // Navigate to the cart page
    await cartPage.navigate();
    
    // Verify the product is in the cart
    const initialItemCount = await cartPage.getItemCount();
    expect(initialItemCount).toBe(1);
    
    // Remove the product from the cart
    await cartPage.removeItem(0);
    
    // Verify the cart is empty
    const updatedItemCount = await cartPage.getItemCount();
    expect(updatedItemCount).toBe(0);
    
    // Verify the empty cart message is displayed
    const isCartEmpty = await cartPage.isCartEmpty();
    expect(isCartEmpty).toBe(true);
  });

  /**
   * Test: Cart persists across page refreshes
   * Priority: P1
   * 
   * This test verifies that the cart contents persist when the user
   * refreshes the page. This is important for maintaining a good user
   * experience during the shopping process.
   */
  test('P1: Cart should persist across page refreshes', async () => {
    // Add a product to the cart
    await productDetailPage.navigateToProduct('sb-001');
    await productDetailPage.addToCart();
    
    // Navigate to the cart page
    await cartPage.navigate();
    
    // Verify the product is in the cart
    const initialItemCount = await cartPage.getItemCount();
    expect(initialItemCount).toBe(1);
    
    // Refresh the page
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Verify the product is still in the cart
    const updatedItemCount = await cartPage.getItemCount();
    expect(updatedItemCount).toBe(1);
    
    // Verify the product name is still correct
    const productNames = await cartPage.getProductNames();
    expect(productNames[0]).toContain('Alpine Freestyle Snowboard');
  });

  /**
   * Test: Cart API operations work correctly
   * Priority: P1
   * 
   * This test verifies that the cart API endpoints work correctly.
   * This is important for ensuring the data layer works correctly.
   */
  test('P1: Cart API operations should work correctly', async () => {
    // Create a new cart
    const newCartResponse = await apiHelper.getCart(null);
    expect(newCartResponse).toHaveProperty('cartId');
    expect(newCartResponse).toHaveProperty('items');
    expect(newCartResponse.items).toHaveLength(0);
    
    const cartId = newCartResponse.cartId;
    
    // Add an item to the cart
    const addItemResponse = await apiHelper.addToCart({
      cartId,
      productId: 'sb-001',
      quantity: 2
    });
    
    expect(addItemResponse).toHaveProperty('cartId', cartId);
    expect(addItemResponse).toHaveProperty('items');
    expect(addItemResponse.items).toHaveLength(1);
    expect(addItemResponse.items[0]).toHaveProperty('productId', 'sb-001');
    expect(addItemResponse.items[0]).toHaveProperty('quantity', 2);
    
    // Update the item quantity
    const updateItemResponse = await apiHelper.updateCartItem({
      cartId,
      productId: 'sb-001',
      quantity: 3
    });
    
    expect(updateItemResponse).toHaveProperty('cartId', cartId);
    expect(updateItemResponse).toHaveProperty('items');
    expect(updateItemResponse.items).toHaveLength(1);
    expect(updateItemResponse.items[0]).toHaveProperty('productId', 'sb-001');
    expect(updateItemResponse.items[0]).toHaveProperty('quantity', 3);
    
    // Remove the item from the cart
    const removeItemResponse = await apiHelper.removeFromCart(cartId, 'sb-001');
    
    expect(removeItemResponse).toHaveProperty('cartId', cartId);
    expect(removeItemResponse).toHaveProperty('items');
    expect(removeItemResponse.items).toHaveLength(0);
  });

  /**
   * Test: Buy Now functionality works correctly
   * Priority: P1
   * 
   * This test verifies that the Buy Now button adds the product to the cart
   * and redirects to the checkout page. This is important for providing a
   * streamlined purchasing experience.
   */
  test('P1: Buy Now functionality should work correctly', async () => {
    // Navigate to a product detail page
    await productDetailPage.navigateToProduct('sb-001');
    
    // Click the Buy Now button
    await productDetailPage.buyNow();
    
    // Verify we're redirected to the checkout page
    const currentUrl = await page.url();
    expect(currentUrl).toContain('/checkout');
    
    // Navigate to the cart page to verify the product was added
    await cartPage.navigate();
    
    // Verify the product is in the cart
    const itemCount = await cartPage.getItemCount();
    expect(itemCount).toBe(1);
    
    // Verify the product name
    const productNames = await cartPage.getProductNames();
    expect(productNames[0]).toContain('Alpine Freestyle Snowboard');
  });

  /**
   * Test: Cart calculations are correct
   * Priority: P1
   * 
   * This test verifies that the cart calculates subtotal, tax, and total
   * correctly. This is important for ensuring the pricing is accurate.
   */
  test('P1: Cart calculations should be correct', async () => {
    // Add two different products to the cart
    await productDetailPage.navigateToProduct('sb-001');
    await productDetailPage.addToCart();
    
    await productDetailPage.navigateToProduct('bd-001');
    await productDetailPage.addToCart();
    
    // Navigate to the cart page
    await cartPage.navigate();
    
    // Verify both products are in the cart
    const itemCount = await cartPage.getItemCount();
    expect(itemCount).toBe(2);
    
    // Get the subtotal, tax, and total
    const subtotal = await cartPage.getSubtotal();
    const tax = await cartPage.getTax();
    const total = await cartPage.getTotal();
    
    // Get the product prices
    const product1 = testDataHelper.getTestProduct('sb-001');
    const product2 = testDataHelper.getTestProduct('bd-001');
    
    // Calculate expected values
    const expectedSubtotal = product1.price + product2.price;
    const expectedTax = expectedSubtotal * 0.08; // Assuming 8% tax rate
    const expectedTotal = expectedSubtotal + expectedTax;
    
    // Verify calculations are correct (allowing for small floating point differences)
    expect(Math.abs(subtotal - expectedSubtotal)).toBeLessThan(0.01);
    expect(Math.abs(total - expectedTotal)).toBeLessThan(0.01);
  });

  /**
   * Test: Empty cart shows appropriate message
   * Priority: P2
   * 
   * This test verifies that an empty cart shows an appropriate message
   * and provides a way to continue shopping. This is important for
   * guiding users when they have an empty cart.
   */
  test('P2: Empty cart should show appropriate message', async () => {
    // Navigate to the cart page with an empty cart
    await cartPage.navigate();
    
    // Verify the empty cart message is displayed
    const isCartEmpty = await cartPage.isCartEmpty();
    expect(isCartEmpty).toBe(true);
    
    // Verify the continue shopping button is displayed
    const continueShoppingButton = await page.$('a:contains("Continue Shopping")');
    expect(continueShoppingButton).not.toBeNull();
    
    // Click the continue shopping button
    await cartPage.continueShopping();
    
    // Verify we're redirected to the products page
    const currentUrl = await page.url();
    expect(currentUrl).toContain('/products');
  });
});
