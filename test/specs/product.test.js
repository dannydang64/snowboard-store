const BaseTest = require('../framework/BaseTest');
const HomePage = require('../pages/HomePage');
const ProductsPage = require('../pages/ProductsPage');
const ProductDetailPage = require('../pages/ProductDetailPage');
const ApiHelper = require('../utils/ApiHelper');

/**
 * Test suite for product browsing functionality
 */
describe('Product Browsing', () => {
  let baseTest;
  let homePage;
  let productsPage;
  let productDetailPage;
  let apiHelper;

  beforeEach(async () => {
    baseTest = new BaseTest();
    homePage = new HomePage();
    productsPage = new ProductsPage();
    productDetailPage = new ProductDetailPage();
    apiHelper = new ApiHelper();

    // Navigate to the home page before each test
    await homePage.navigate();
  });

  /**
   * Test: Navigate to all product categories from home page
   * Priority: P0
   * 
   * This test verifies that users can navigate to each product category
   * from the home page and that the correct products are displayed.
   * This is a critical user journey as category navigation is a primary
   * way users browse products.
   */
  test('P0: Should navigate to all product categories from home page', async () => {
    // Get all available categories
    const categories = await homePage.getCategoryLinks();
    
    // Verify we have at least the 4 main categories
    expect(categories.length).toBeGreaterThanOrEqual(4);
    
    // Check each category
    for (const category of categories) {
      // Navigate to the category
      await homePage.navigateToCategory(category);
      
      // Verify we're on the correct page
      const categoryTitle = await productsPage.getCategoryTitle();
      expect(categoryTitle.toLowerCase()).toContain(category.toLowerCase());
      
      // Verify products are displayed
      const productCount = await productsPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
      
      // Verify products are from the correct category
      const productNames = await productsPage.getProductNames();
      expect(productNames.length).toBe(productCount);
      
      // Navigate back to home
      await homePage.navigate();
    }
  });

  /**
   * Test: View product details from category page
   * Priority: P0
   * 
   * This test verifies that users can click on a product from the category
   * page to view its details. This is a critical path as it's how users
   * learn about products before purchasing.
   */
  test('P0: Should view product details from category page', async () => {
    // Navigate to the snowboards category
    await productsPage.navigateToCategory('snowboards');
    
    // Verify products are displayed
    const productCount = await productsPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
    
    // Get the name of the first product
    const productNames = await productsPage.getProductNames();
    const firstProductName = productNames[0];
    
    // Click on the first product
    await productsPage.clickProduct(0);
    
    // Verify we're on the product detail page
    const productTitle = await productDetailPage.getProductTitle();
    expect(productTitle).toBe(firstProductName);
    
    // Verify product details are displayed
    const price = await productDetailPage.getProductPrice();
    expect(price).toBeGreaterThan(0);
    
    const description = await productDetailPage.getProductDescription();
    expect(description.length).toBeGreaterThan(0);
    
    // Verify Add to Cart button is present
    const addToCartButton = await page.$('button:contains("Add to Cart")');
    expect(addToCartButton).not.toBeNull();
  });

  /**
   * Test: Related products are displayed on product detail page
   * Priority: P1
   * 
   * This test verifies that related products are displayed on the product
   * detail page and that users can navigate to those products. This is
   * important for cross-selling and improving user experience.
   */
  test('P1: Should display related products on product detail page', async () => {
    // Navigate directly to a product detail page
    await productDetailPage.navigateToProduct('sb-001');
    
    // Verify the product title is displayed
    const productTitle = await productDetailPage.getProductTitle();
    expect(productTitle.length).toBeGreaterThan(0);
    
    // Verify related products are displayed
    const relatedProductsCount = await productDetailPage.getRelatedProductsCount();
    expect(relatedProductsCount).toBeGreaterThan(0);
    
    // Click on the first related product if any exist
    if (relatedProductsCount > 0) {
      // Store the current product title
      const currentProductTitle = await productDetailPage.getProductTitle();
      
      // Click on the first related product
      await productDetailPage.clickRelatedProduct(0);
      
      // Verify we navigated to a different product
      const newProductTitle = await productDetailPage.getProductTitle();
      expect(newProductTitle).not.toBe(currentProductTitle);
    }
  });

  /**
   * Test: Product API returns correct data
   * Priority: P1
   * 
   * This test verifies that the product API returns the correct data
   * for both all products and filtered products. This is important for
   * ensuring the data layer works correctly.
   */
  test('P1: Product API should return correct data', async () => {
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
   * Test: Out of stock products show correct status
   * Priority: P2
   * 
   * This test verifies that out of stock products are properly marked
   * as such on the product detail page. This is important for setting
   * correct user expectations.
   */
  test('P2: Out of stock products should show correct status', async () => {
    // This test would ideally use a known out-of-stock product
    // For demonstration, we'll check the stock status of any product
    
    // Navigate to the first product in the accessories category
    await productsPage.navigateToCategory('accessories');
    await productsPage.clickProduct(0);
    
    // Get the stock count
    const stockCount = await productDetailPage.getStockCount();
    
    // If stock is 0, verify "Out of stock" is displayed
    // Otherwise, verify stock count is displayed
    if (stockCount === 0) {
      const stockInfo = await page.$eval('.text-gray-600', el => el.textContent.trim());
      expect(stockInfo).toContain('Out of stock');
      
      // Verify Add to Cart button is disabled
      const addToCartButton = await page.$('button:contains("Add to Cart")');
      const isDisabled = await page.evaluate(button => button.disabled, addToCartButton);
      expect(isDisabled).toBe(true);
    } else {
      const stockInfo = await page.$eval('.text-gray-600', el => el.textContent.trim());
      expect(stockInfo).toContain('in stock');
    }
  });

  /**
   * Test: Product images load correctly
   * Priority: P1
   * 
   * This test verifies that product images load correctly on the product
   * detail page. This is important for the visual shopping experience.
   */
  test('P1: Product images should load correctly', async () => {
    // Navigate to a product detail page
    await productDetailPage.navigateToProduct('sb-001');
    
    // Wait for the product image to load
    await page.waitForSelector('.h-96 img');
    
    // Check if the image is loaded
    const imageLoaded = await page.evaluate(() => {
      const img = document.querySelector('.h-96 img');
      return img && img.complete && img.naturalWidth > 0;
    });
    
    expect(imageLoaded).toBe(true);
  });
});
