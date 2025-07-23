/**
 * Product Browsing Test Suite
 * Tests the product browsing functionality of the Snow Ice e-commerce application
 * Covers category navigation, product details, filtering, and sorting
 */
const EnhancedBaseTest = require('../framework/EnhancedBaseTest');
const ProductsPage = require('../pages/ProductsPage');
const ProductDetailPage = require('../pages/ProductDetailPage');
const TestReporter = require('../utils/TestReporter');

describe('Product Browsing', () => {
  let test;
  let productsPage;
  let productDetailPage;
  let testInfo;

  beforeEach(async () => {
    test = new EnhancedBaseTest();
    productsPage = new ProductsPage();
    productDetailPage = new ProductDetailPage();
    
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
   * Test: Navigate to product category
   * Priority: P0
   * 
   * This test verifies that users can navigate to different product categories
   * and that the correct products are displayed for each category.
   */
  it('P0: Should navigate to product category and display correct products', async () => {
    // Start performance measurement
    test.performance.startMeasurement('categoryNavigation');
    
    // Navigate to snowboards category
    await productsPage.navigateToCategory('snowboards');
    
    // Wait for products to load
    await test.wait.waitForElements('.product-card', 1);
    
    // Verify category title
    const categoryTitle = await test.getElementText('h1');
    test.assert.assertTrue(
      categoryTitle.toLowerCase().includes('snowboards'),
      'Category title should include "snowboards"'
    );
    
    // Get product cards
    const productCards = await page.$$('.product-card');
    
    // Verify at least one product is displayed
    expect(productCards.length).toBeGreaterThan(0);
    
    // Get product data from test data
    const snowboardProducts = await test.data.getProductsByCategory('snowboards');
    
    // Verify at least one product matches the expected category
    const productTitles = await Promise.all(
      productCards.map(card => card.$eval('h2', el => el.textContent))
    );
    
    // Find at least one matching product
    const hasMatchingProduct = productTitles.some(title => 
      snowboardProducts.some(product => title.includes(product.name))
    );
    
    expect(hasMatchingProduct).toBe(true);
    
    // End performance measurement
    const perfMetric = test.performance.endMeasurement('categoryNavigation');
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_PROD_001',
      testCaseName: 'Navigate to product category',
      description: 'Verifies that users can navigate to different product categories and that the correct products are displayed',
      featureArea: 'Product Browsing',
      priority: 'P0',
      testType: 'Positive',
      expectedResults: 'Category page should load with products from the selected category',
      actualResults: 'Category page loaded with correct products',
      status: 'Pass',
      executionTime: perfMetric ? perfMetric.duration : 0
    });
  });

  /**
   * Test: View product details
   * Priority: P0
   * 
   * This test verifies that users can view detailed information about a product
   * by clicking on a product card.
   */
  it('P0: Should display product details when product is selected', async () => {
    // Get test product data
    const testProduct = await test.data.getProduct('sb-001');
    
    // Navigate directly to product detail page
    await productDetailPage.navigateToProduct(testProduct.id);
    
    // Wait for product details to load
    await test.wait.waitForElement('[data-testid="product-detail"]');
    
    // Verify product details using the enhanced verification method
    await test.verifyProductDetails(testProduct);
    
    // Verify product specifications are displayed
    if (testProduct.specs) {
      const specsSection = await page.$('.product-specs');
      expect(specsSection).not.toBeNull();
      
      // Check for each specification
      for (const [key, value] of Object.entries(testProduct.specs)) {
        const specText = await page.evaluate(el => el.textContent, specsSection);
        expect(specText).toContain(value.toString());
      }
    }
    
    // Verify add to cart button is present
    const addToCartButton = await page.$('[data-testid="add-to-cart"]');
    expect(addToCartButton).not.toBeNull();
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_PROD_002',
      testCaseName: 'View product details',
      description: 'Verifies that users can view detailed information about a product',
      featureArea: 'Product Details',
      priority: 'P0',
      testType: 'Positive',
      expectedResults: 'Product detail page should display complete product information',
      actualResults: 'Product detail page displayed correct information',
      status: 'Pass',
      executionTime: testInfo.duration
    });
  });

  /**
   * Test: Filter products by category
   * Priority: P1
   * 
   * This test verifies that users can filter products by category
   * and that the filtering works correctly.
   */
  it('P1: Should filter products by category', async () => {
    // Navigate to all products page
    await productsPage.navigate();
    
    // Wait for products to load
    await test.wait.waitForElements('.product-card', 1);
    
    // Get initial product count
    const initialProductCount = await productsPage.getProductCount();
    
    // Select a category filter (bindings)
    await productsPage.selectCategoryFilter('bindings');
    
    // Wait for filtered products to load
    await test.wait.waitForCondition(async () => {
      const currentCount = await productsPage.getProductCount();
      return currentCount !== initialProductCount;
    }, { timeout: 5000, errorMessage: 'Products did not update after filtering' });
    
    // Get filtered products
    const filteredProducts = await productsPage.getProductElements();
    
    // Verify filtered products belong to the selected category
    for (const productEl of filteredProducts) {
      const productCategory = await productEl.$eval('[data-category]', el => el.getAttribute('data-category'));
      expect(productCategory).toBe('bindings');
    }
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_PROD_003',
      testCaseName: 'Filter products by category',
      description: 'Verifies that users can filter products by category',
      featureArea: 'Product Browsing',
      priority: 'P1',
      testType: 'Positive',
      expectedResults: 'Only products from the selected category should be displayed',
      actualResults: 'Products were correctly filtered by category',
      status: 'Pass',
      executionTime: testInfo.duration
    });
  });

  /**
   * Test: Sort products by price
   * Priority: P1
   * 
   * This test verifies that users can sort products by price
   * and that the sorting works correctly.
   */
  it('P1: Should sort products by price', async () => {
    // Navigate to all products page
    await productsPage.navigate();
    
    // Wait for products to load
    await test.wait.waitForElements('.product-card', 2);
    
    // Get initial product prices
    const initialPrices = await productsPage.getProductPrices();
    
    // Select price sorting (low to high)
    await productsPage.selectSorting('price-asc');
    
    // Wait for sorted products to load
    await test.wait.waitForCondition(async () => {
      return true; // In a real test, we'd check for a loading indicator or network request
    }, { timeout: 2000 });
    
    // Get sorted product prices
    const sortedPrices = await productsPage.getProductPrices();
    
    // Verify products are sorted by price (low to high)
    for (let i = 0; i < sortedPrices.length - 1; i++) {
      expect(sortedPrices[i]).toBeLessThanOrEqual(sortedPrices[i + 1]);
    }
    
    // Select price sorting (high to low)
    await productsPage.selectSorting('price-desc');
    
    // Wait for sorted products to load
    await test.wait.waitForCondition(async () => {
      return true; // In a real test, we'd check for a loading indicator or network request
    }, { timeout: 2000 });
    
    // Get sorted product prices
    const reverseSortedPrices = await productsPage.getProductPrices();
    
    // Verify products are sorted by price (high to low)
    for (let i = 0; i < reverseSortedPrices.length - 1; i++) {
      expect(reverseSortedPrices[i]).toBeGreaterThanOrEqual(reverseSortedPrices[i + 1]);
    }
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_PROD_004',
      testCaseName: 'Sort products by price',
      description: 'Verifies that users can sort products by price',
      featureArea: 'Product Browsing',
      priority: 'P1',
      testType: 'Positive',
      expectedResults: 'Products should be sorted according to the selected order',
      actualResults: 'Products were correctly sorted by price',
      status: 'Pass',
      executionTime: testInfo.duration
    });
  });

  /**
   * Test: Search for products
   * Priority: P1
   * 
   * This test verifies that users can search for products
   * and that the search functionality works correctly.
   */
  it('P1: Should search for products by keyword', async () => {
    // Navigate to home page
    await test.navigateToHome();
    
    // Wait for search input to be available
    await test.wait.waitForElement('#search-input');
    
    // Enter search term
    await page.type('#search-input', 'snowboard');
    
    // Submit search form
    await page.click('#search-submit');
    
    // Wait for search results to load
    await test.wait.waitForElements('.product-card', 1);
    
    // Get search results
    const searchResults = await productsPage.getProductElements();
    
    // Verify search results contain the search term
    for (const productEl of searchResults) {
      const productName = await productEl.$eval('h2', el => el.textContent.toLowerCase());
      const productDescription = await productEl.$eval('p', el => el.textContent.toLowerCase());
      
      // Check if either name or description contains the search term
      const containsSearchTerm = 
        productName.includes('snowboard') || 
        productDescription.includes('snowboard');
      
      expect(containsSearchTerm).toBe(true);
    }
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_PROD_005',
      testCaseName: 'Search for products by keyword',
      description: 'Verifies that users can search for products by keyword',
      featureArea: 'Product Browsing',
      priority: 'P1',
      testType: 'Positive',
      expectedResults: 'Search results should contain products matching the search term',
      actualResults: 'Search returned correct products matching the keyword',
      status: 'Pass',
      executionTime: testInfo.duration
    });
  });

  /**
   * Test: Handle no search results
   * Priority: P2
   * 
   * This test verifies that the application handles the case
   * when a search returns no results.
   */
  it('P2: Should handle no search results gracefully', async () => {
    // Navigate to home page
    await test.navigateToHome();
    
    // Wait for search input to be available
    await test.wait.waitForElement('#search-input');
    
    // Enter search term that should not match any products
    await page.type('#search-input', 'xyznonexistentproduct123');
    
    // Submit search form
    await page.click('#search-submit');
    
    // Wait for no results message
    await test.wait.waitForElement('.no-results-message');
    
    // Verify no results message is displayed
    const noResultsMessage = await page.$eval('.no-results-message', el => el.textContent);
    expect(noResultsMessage).toContain('No products found');
    
    // Verify no product cards are displayed
    const productCards = await page.$$('.product-card');
    expect(productCards.length).toBe(0);
    
    // Record test result
    TestReporter.recordTestResult({
      testCaseId: 'TC_PROD_006',
      testCaseName: 'Handle no search results',
      description: 'Verifies that the application handles the case when a search returns no results',
      featureArea: 'Product Browsing',
      priority: 'P2',
      testType: 'Negative',
      expectedResults: 'Application should display a message indicating no results were found',
      actualResults: 'No results message was displayed correctly',
      status: 'Pass',
      executionTime: testInfo.duration
    });
  });
});
