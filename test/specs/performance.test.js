const BaseTest = require('../framework/BaseTest');
const HomePage = require('../pages/HomePage');
const ProductsPage = require('../pages/ProductsPage');
const ProductDetailPage = require('../pages/ProductDetailPage');
const CartPage = require('../pages/CartPage');
const CheckoutPage = require('../pages/CheckoutPage');
const ApiHelper = require('../utils/ApiHelper');
const TestDataHelper = require('../utils/TestDataHelper');
const PerformanceHelper = require('../utils/PerformanceHelper');

/**
 * Test suite for performance testing
 */
describe('Performance Tests', () => {
  let baseTest;
  let homePage;
  let productsPage;
  let productDetailPage;
  let cartPage;
  let checkoutPage;
  let apiHelper;
  let testDataHelper;
  let performanceHelper;

  beforeAll(async () => {
    baseTest = new BaseTest();
    homePage = new HomePage();
    productsPage = new ProductsPage();
    productDetailPage = new ProductDetailPage();
    cartPage = new CartPage();
    checkoutPage = new CheckoutPage();
    apiHelper = new ApiHelper();
    testDataHelper = new TestDataHelper();
    performanceHelper = new PerformanceHelper();
  });

  /**
   * Test: Measure page load times
   * Priority: P1
   * 
   * This test measures the load time of key pages in the application.
   * It's important to ensure pages load quickly for a good user experience.
   */
  test('P1: Page load times should meet performance thresholds', async () => {
    // Measure home page load time
    const homeLoadTime = await performanceHelper.measurePageLoad('home', async () => {
      await homePage.navigate();
    });
    
    console.log(`Home page load time: ${homeLoadTime}ms`);
    expect(performanceHelper.meetsThreshold('pageLoad', 'home', homeLoadTime)).toBe(true);
    
    // Measure products page load time
    const productsLoadTime = await performanceHelper.measurePageLoad('product', async () => {
      await productsPage.navigate();
    });
    
    console.log(`Products page load time: ${productsLoadTime}ms`);
    expect(performanceHelper.meetsThreshold('pageLoad', 'product', productsLoadTime)).toBe(true);
    
    // Measure product detail page load time
    const productDetailLoadTime = await performanceHelper.measurePageLoad('productDetail', async () => {
      await productDetailPage.navigateToProduct('sb-001');
    });
    
    console.log(`Product detail page load time: ${productDetailLoadTime}ms`);
    expect(performanceHelper.meetsThreshold('pageLoad', 'product', productDetailLoadTime)).toBe(true);
    
    // Measure cart page load time
    const cartLoadTime = await performanceHelper.measurePageLoad('cart', async () => {
      await cartPage.navigate();
    });
    
    console.log(`Cart page load time: ${cartLoadTime}ms`);
    expect(performanceHelper.meetsThreshold('pageLoad', 'cart', cartLoadTime)).toBe(true);
    
    // Measure checkout page load time
    const checkoutLoadTime = await performanceHelper.measurePageLoad('checkout', async () => {
      // Add a product to the cart first
      await productDetailPage.navigateToProduct('sb-001');
      await productDetailPage.addToCart();
      await checkoutPage.navigate();
    });
    
    console.log(`Checkout page load time: ${checkoutLoadTime}ms`);
    expect(performanceHelper.meetsThreshold('pageLoad', 'checkout', checkoutLoadTime)).toBe(true);
  });

  /**
   * Test: Measure API response times
   * Priority: P1
   * 
   * This test measures the response time of key API endpoints.
   * It's important to ensure API calls are fast for a responsive application.
   */
  test('P1: API response times should meet performance thresholds', async () => {
    // Measure products API response time
    const productsApiTime = await performanceHelper.measureApiResponse('products', async () => {
      await apiHelper.getProducts();
    });
    
    console.log(`Products API response time: ${productsApiTime}ms`);
    expect(performanceHelper.meetsThreshold('apiResponse', 'products', productsApiTime)).toBe(true);
    
    // Measure product by ID API response time
    const productByIdApiTime = await performanceHelper.measureApiResponse('productById', async () => {
      await apiHelper.getProductById('sb-001');
    });
    
    console.log(`Product by ID API response time: ${productByIdApiTime}ms`);
    expect(performanceHelper.meetsThreshold('apiResponse', 'products', productByIdApiTime)).toBe(true);
    
    // Measure cart API response time
    const cartApiTime = await performanceHelper.measureApiResponse('cart', async () => {
      const response = await apiHelper.getCart(null);
      const cartId = response.cartId;
      await apiHelper.addToCart({
        cartId,
        productId: 'sb-001',
        quantity: 1
      });
    });
    
    console.log(`Cart API response time: ${cartApiTime}ms`);
    expect(performanceHelper.meetsThreshold('apiResponse', 'cart', cartApiTime)).toBe(true);
    
    // Measure orders API response time
    const ordersApiTime = await performanceHelper.measureApiResponse('orders', async () => {
      await apiHelper.getOrders();
    });
    
    console.log(`Orders API response time: ${ordersApiTime}ms`);
    expect(performanceHelper.meetsThreshold('apiResponse', 'orders', ordersApiTime)).toBe(true);
  });

  /**
   * Test: Measure user interaction times
   * Priority: P1
   * 
   * This test measures the response time of key user interactions.
   * It's important to ensure user interactions are fast for a good user experience.
   */
  test('P1: User interaction times should meet performance thresholds', async () => {
    // Measure add to cart interaction time
    await productDetailPage.navigateToProduct('sb-001');
    
    const addToCartTime = await performanceHelper.measureInteraction('addToCart', async () => {
      await productDetailPage.addToCart();
    });
    
    console.log(`Add to cart interaction time: ${addToCartTime}ms`);
    expect(performanceHelper.meetsThreshold('interaction', 'addToCart', addToCartTime)).toBe(true);
    
    // Measure update quantity interaction time
    await cartPage.navigate();
    
    const updateQuantityTime = await performanceHelper.measureInteraction('updateQuantity', async () => {
      await cartPage.updateItemQuantity(0, 3);
    });
    
    console.log(`Update quantity interaction time: ${updateQuantityTime}ms`);
    expect(performanceHelper.meetsThreshold('interaction', 'updateQuantity', updateQuantityTime)).toBe(true);
  });

  /**
   * Test: Measure checkout flow performance
   * Priority: P0
   * 
   * This test measures the performance of the complete checkout flow.
   * It's critical to ensure the checkout process is fast and responsive.
   */
  test('P0: Checkout flow should meet performance thresholds', async () => {
    // Clear the cart first
    await baseTest.clearCart();
    
    // Add a product to the cart
    await productDetailPage.navigateToProduct('sb-001');
    await productDetailPage.addToCart();
    
    // Navigate to cart and proceed to checkout
    await cartPage.navigate();
    await cartPage.proceedToCheckout();
    
    // Generate test customer data
    const testCustomer = testDataHelper.generateCustomer();
    
    // Measure checkout interaction time
    const checkoutTime = await performanceHelper.measureInteraction('checkout', async () => {
      await checkoutPage.completeCheckout(testCustomer);
    });
    
    console.log(`Complete checkout flow time: ${checkoutTime}ms`);
    expect(performanceHelper.meetsThreshold('interaction', 'checkout', checkoutTime)).toBe(true);
  });

  /**
   * Test: Generate performance report
   * Priority: P2
   * 
   * This test generates a performance report with all metrics.
   * It's useful for analyzing the overall performance of the application.
   */
  test('P2: Generate performance report', async () => {
    const report = performanceHelper.generateReport();
    console.log('Performance Report Summary:');
    console.log(`Page Loads: ${report.summary.pageLoads.passRate}% meet thresholds`);
    console.log(`API Calls: ${report.summary.apiCalls.passRate}% meet thresholds`);
    console.log(`Interactions: ${report.summary.interactions.passRate}% meet thresholds`);
    console.log(`Overall: ${report.summary.overall.passRate}% meet thresholds`);
    
    // Write report to file
    const fs = require('fs');
    const path = require('path');
    const reportsDir = path.join(process.cwd(), 'reports');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`Performance report saved to: ${reportPath}`);
    
    // Verify overall performance meets expectations
    expect(parseFloat(report.summary.overall.passRate)).toBeGreaterThanOrEqual(80);
  });
});
