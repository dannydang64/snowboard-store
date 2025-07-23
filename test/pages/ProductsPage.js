const BasePage = require('./BasePage');
const BaseTest = require('../framework/BaseTest');

/**
 * Page Object for the Products listing page
 * Handles interactions with product listings and category pages
 */
class ProductsPage extends BasePage {
  constructor() {
    super();
    this.baseTest = new BaseTest();
    this.testMode = this.baseTest.testMode;
    this.mockData = this.baseTest.mockData;
    
    // Selectors specific to the products page
    this.selectors = {
      ...this.selectors,
      productGrid: '.grid-cols-1.md\\:grid-cols-3.lg\\:grid-cols-4',
      productCards: '.card',
      productNames: '.card h3',
      productPrices: '.card .text-xl',
      categoryTitle: 'h1',
      sortDropdown: 'select#sort',
      filterCheckboxes: '.filter-options input[type="checkbox"]',
      noResults: '.no-results',
      pagination: '.pagination',
      loadingIndicator: '.loading-indicator'
    };
  }

  /**
   * Navigate to the products page
   */
  async navigate() {
    if (this.testMode === 'mock') {
      await page.goto('http://localhost:3000/products');
      console.log('Navigating to products page in mock mode');
      return;
    }
    
    await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle0' });
  }

  /**
   * Navigate to a specific category page
   * @param {string} category - The category name (snowboards, bindings, boots, accessories)
   */
  async navigateToCategory(category) {
    if (this.testMode === 'mock') {
      await page.goto(`http://localhost:3000/products/category/${category.toLowerCase()}`);
      console.log(`Navigating to ${category} category in mock mode`);
      return;
    }
    
    await page.goto(`http://localhost:3000/products/category/${category.toLowerCase()}`, { 
      waitUntil: 'networkidle0' 
    });
  }

  /**
   * Get the current category title
   * @returns {string} The category title text
   */
  async getCategoryTitle() {
    if (this.testMode === 'mock') {
      const url = await page.url();
      if (url.includes('/category/')) {
        const category = url.split('/').pop();
        return category.charAt(0).toUpperCase() + category.slice(1);
      }
      return 'All Products';
    }
    
    try {
      await page.waitForSelector(this.selectors.categoryTitle);
      return page.$eval(this.selectors.categoryTitle, el => el.textContent.trim());
    } catch (error) {
      return null; // No category title found
    }
  }

  /**
   * Get the number of products displayed
   * @returns {number} The number of product cards
   */
  async getProductCount() {
    if (this.testMode === 'mock') {
      const url = await page.url();
      if (url.includes('/category/')) {
        const category = url.split('/').pop();
        return this.mockData.products.filter(p => p.category === category).length;
      }
      return this.mockData.products.length;
    }
    
    try {
      await page.waitForSelector(this.selectors.productCards);
      return page.$$eval(this.selectors.productCards, cards => cards.length);
    } catch (error) {
      return 0; // No products found
    }
  }

  /**
   * Get all product names currently displayed
   * @returns {Array<string>} Array of product names
   */
  async getProductNames() {
    if (this.testMode === 'mock') {
      const url = await page.url();
      if (url.includes('/category/')) {
        const category = url.split('/').pop();
        return this.mockData.products
          .filter(p => p.category === category)
          .map(p => p.name);
      }
      return this.mockData.products.map(p => p.name);
    }
    
    try {
      await page.waitForSelector(this.selectors.productNames);
      return page.$$eval(this.selectors.productNames, names => 
        names.map(name => name.textContent.trim())
      );
    } catch (error) {
      return []; // No product names found
    }
  }

  /**
   * Get all product prices currently displayed
   * @returns {Array<number>} Array of product prices (as numbers)
   */
  async getProductPrices() {
    if (this.testMode === 'mock') {
      const url = await page.url();
      if (url.includes('/category/')) {
        const category = url.split('/').pop();
        return this.mockData.products
          .filter(p => p.category === category)
          .map(p => p.price);
      }
      return this.mockData.products.map(p => p.price);
    }
    
    try {
      await page.waitForSelector(this.selectors.productPrices);
      return page.$$eval(this.selectors.productPrices, prices => 
        prices.map(price => {
          const priceText = price.textContent.trim();
          // Extract the number from the price text (e.g., "$499.99" -> 499.99)
          const match = priceText.match(/[\d.]+/);
          return match ? parseFloat(match[0]) : 0;
        })
      );
    } catch (error) {
      return []; // No product prices found
    }
  }

  /**
   * Sort products by the specified criteria
   * @param {string} sortBy - The sort criteria (price-asc, price-desc, name-asc, name-desc, rating)
   */
  async sortProductsBy(sortBy) {
    try {
      await page.waitForSelector(this.selectors.sortDropdown);
      await page.select(this.selectors.sortDropdown, sortBy);
      
      // Wait for products to be re-sorted
      await page.waitForTimeout(500);
    } catch (error) {
      throw new Error(`Failed to sort products: ${error.message}`);
    }
  }

  /**
   * Click on a product by index (0-based)
   * @param {number} index - The index of the product to click
   */
  async clickProduct(index) {
    if (this.testMode === 'mock') {
      const url = await page.url();
      let products = this.mockData.products;
      
      if (url.includes('/category/')) {
        const category = url.split('/').pop();
        products = products.filter(p => p.category === category);
      }
      
      if (index >= 0 && index < products.length) {
        const product = products[index];
        await page.goto(`http://localhost:3000/products/${product.id}`);
        console.log(`Clicked on product ${product.name} in mock mode`);
        return;
      } else {
        throw new Error(`Product index ${index} out of bounds`);
      }
    }
    
    try {
      const productCards = await page.$$(this.selectors.productCards);
      
      if (index >= 0 && index < productCards.length) {
        // Click the product name link within the card
        const productLink = await productCards[index].$('h3');
        await productLink.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
      } else {
        throw new Error(`Product index ${index} out of bounds`);
      }
    } catch (error) {
      throw new Error(`Failed to click product: ${error.message}`);
    }
  }

  /**
   * Click the "Add to Cart" button for a product by index (0-based)
   * @param {number} index - The index of the product to add to cart
   */
  async addProductToCart(index) {
    try {
      const productCards = await page.$$(this.selectors.productCards);
      
      if (index >= 0 && index < productCards.length) {
        // Click the "Add to Cart" button within the card
        const addToCartButton = await productCards[index].$('button.btn-secondary');
        await addToCartButton.click();
        
        // Wait for cart to update
        await page.waitForTimeout(500);
      } else {
        throw new Error(`Product index ${index} out of bounds`);
      }
    } catch (error) {
      throw new Error(`Failed to add product to cart: ${error.message}`);
    }
  }

  /**
   * Check if the "No Results" message is displayed
   * @returns {boolean} True if the no results message is displayed
   */
  async isNoResultsDisplayed() {
    try {
      return await page.$(this.selectors.noResults) !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if pagination is available
   * @returns {boolean} True if pagination is available
   */
  async isPaginationAvailable() {
    try {
      return await page.$(this.selectors.pagination) !== null;
    } catch (error) {
      return false;
    }
  }
}

module.exports = ProductsPage;
