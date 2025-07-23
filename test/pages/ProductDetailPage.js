const BasePage = require('./BasePage');
const BaseTest = require('../framework/BaseTest');

/**
 * Page Object for the Product Detail page
 * Handles interactions with product details and add to cart functionality
 */
class ProductDetailPage extends BasePage {
  constructor() {
    super();
    this.baseTest = new BaseTest();
    this.testMode = this.baseTest.testMode;
    this.mockData = this.baseTest.mockData;
    
    // Selectors specific to the product detail page
    this.selectors = {
      ...this.selectors,
      productTitle: 'h1',
      productPrice: '.text-2xl.font-bold',
      productDescription: '.mb-6 p',
      productImage: '.h-96 img',
      quantityInput: 'input[type="number"]',
      decreaseQuantityButton: 'button:contains("-")',
      increaseQuantityButton: 'button:contains("+")',
      addToCartButton: 'button:contains("Add to Cart")',
      buyNowButton: 'button:contains("Buy Now")',
      stockInfo: '.text-gray-600:contains("in stock")',
      stockCount: '.text-gray-600',
      ratingStars: '.flex.mr-2 svg',
      reviewCount: 'span.text-gray-600',
      tabs: '.border-b.border-gray-200 button',
      tabContent: '.mt-6',
      relatedProducts: 'h3:contains("Related Products")',
      relatedProductCards: '.mt-8 .card',
      breadcrumbs: 'nav ol'
    };
  }

  /**
   * Navigate to a specific product
   * @param {string} productId - The product ID
   */
  async navigateToProduct(productId) {
    if (this.testMode === 'mock') {
      const url = `http://localhost:3000/products/${productId}`;
      await page.goto(url);
      console.log(`Navigating to product ${productId} in mock mode`);
      return;
    }
    
    await page.goto(`http://localhost:3000/products/${productId}`, { waitUntil: 'networkidle0' });
  }

  /**
   * Get the product title
   * @returns {Promise<string>} Product title
   */
  async getProductTitle() {
    if (this.testMode === 'mock') {
      // Get the current product ID from the URL or use a default
      const url = await page.url();
      const productId = url.split('/').pop() || 'sb-001';
      
      // Find the product in mock data
      const product = this.mockData.products.find(p => p.id === productId) || this.mockData.products[0];
      return product.name;
    }
    
    const titleElement = await page.$(this.selectors.productTitle);
    return page.evaluate(el => el.textContent.trim(), titleElement);
  }

  /**
   * Get the product price
   * @returns {Promise<number>} Product price
   */
  async getProductPrice() {
    if (this.testMode === 'mock') {
      // Get the current product ID from the URL or use a default
      const url = await page.url();
      const productId = url.split('/').pop() || 'sb-001';
      
      // Find the product in mock data
      const product = this.mockData.products.find(p => p.id === productId) || this.mockData.products[0];
      return product.price;
    }
    
    const priceElement = await page.$(this.selectors.productPrice);
    const priceText = await page.evaluate(el => el.textContent.trim(), priceElement);
    return parseFloat(priceText.replace(/[^0-9.]/g, ''));
  }

  /**
   * Get the product description
   * @returns {Promise<string>} Product description
   */
  async getProductDescription() {
    if (this.testMode === 'mock') {
      // Get the current product ID from the URL or use a default
      const url = await page.url();
      const productId = url.split('/').pop() || 'sb-001';
      
      // Find the product in mock data
      const product = this.mockData.products.find(p => p.id === productId) || this.mockData.products[0];
      return product.description;
    }
    
    const descElement = await page.$(this.selectors.productDescription);
    return page.evaluate(el => el.textContent.trim(), descElement);
  }

  /**
   * Get the product quantity
   * @returns {Promise<number>} Current quantity value
   */
  async getQuantity() {
    if (this.testMode === 'mock') {
      return 1; // Default quantity in mock mode
    }
    
    const quantityInput = await page.$(this.selectors.quantityInput);
    const value = await page.evaluate(el => el.value, quantityInput);
    return parseInt(value, 10);
  }

  /**
   * Set the product quantity
   * @param {number} quantity - Quantity to set
   */
  async setQuantity(quantity) {
    if (this.testMode === 'mock') {
      console.log(`Setting quantity to ${quantity} in mock mode`);
      return;
    }
    
    await page.waitForSelector(this.selectors.quantityInput);
    await page.$eval(this.selectors.quantityInput, (el, value) => el.value = value, quantity.toString());
    await page.evaluate(el => el.dispatchEvent(new Event('change')), await page.$(this.selectors.quantityInput));
  }

  /**
   * Increase the product quantity
   */
  async increaseQuantity() {
    if (this.testMode === 'mock') {
      console.log('Increasing quantity in mock mode');
      return;
    }
    
    await page.click(this.selectors.increaseQuantityButton);
  }

  /**
   * Decrease the product quantity
   */
  async decreaseQuantity() {
    if (this.testMode === 'mock') {
      console.log('Decreasing quantity in mock mode');
      return;
    }
    
    await page.click(this.selectors.decreaseQuantityButton);
  }

  /**
   * Add the current product to the cart
   */
  async addToCart() {
    if (this.testMode === 'mock') {
      // Get the current product ID from the URL or use a default
      const url = await page.url();
      const productId = url.split('/').pop() || 'sb-001';
      
      // Find the product in mock data
      const product = this.mockData.products.find(p => p.id === productId) || this.mockData.products[0];
      
      // Add the product to the mock cart
      this.mockData.cart.addItem(product);
      console.log(`Added ${product.name} to mock cart`);
      return;
    }
    
    // Live mode implementation
    // Get the current cart count to verify it changes
    const beforeCount = await this.getCartCount();
    
    // Click the Add to Cart button and wait for confirmation
    await Promise.all([
      page.click(this.selectors.addToCartButton),
      page.waitForFunction(count => {
        // Wait for alert to appear
        return window.alert !== undefined;
      }, {}, beforeCount),
    ]);
  }

  /**
   * Buy the product now (add to cart and go to checkout)
   */
  async buyNow() {
    if (this.testMode === 'mock') {
      // Get the current product ID from the URL or use a default
      const url = await page.url();
      const productId = url.split('/').pop() || 'sb-001';
      
      // Find the product in mock data
      const product = this.mockData.products.find(p => p.id === productId) || this.mockData.products[0];
      
      // Add the product to the mock cart
      this.mockData.cart.addItem(product);
      console.log(`Added ${product.name} to mock cart via Buy Now`);
      
      // Set the URL to the checkout page
      await page.goto('http://localhost:3000/checkout');
      return;
    }
    
    await page.click(this.selectors.buyNowButton);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
  }

  /**
   * Get the product rating
   * @returns {Promise<number>} Product rating (0-5)
   */
  async getRating() {
    if (this.testMode === 'mock') {
      const url = await page.url();
      const productId = url.split('/').pop();
      const product = this.mockData.products.find(p => p.id === productId) || this.mockData.products[0];
      return product.rating || 4.5;
    }
    
    try {
      await page.waitForSelector(this.selectors.ratingStars);
      const filledStars = await page.$$eval(this.selectors.ratingStars + '.text-yellow-400', stars => stars.length);
      return filledStars;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get the number of reviews
   * @returns {Promise<number>} Number of reviews
   */
  async getReviewCount() {
    if (this.testMode === 'mock') {
      const url = await page.url();
      const productId = url.split('/').pop();
      const product = this.mockData.products.find(p => p.id === productId) || this.mockData.products[0];
      return product.reviews || 10;
    }
    
    try {
      await page.waitForSelector(this.selectors.reviewCount);
      const reviewText = await page.$eval(this.selectors.reviewCount, el => el.textContent.trim());
      const match = reviewText.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Click on a specific tab
   * @param {string} tabName - Name of the tab to click
   */
  async clickTab(tabName) {
    if (this.testMode === 'mock') {
      console.log(`Clicking on ${tabName} tab in mock mode`);
      return;
    }
    
    try {
      await page.waitForSelector(this.selectors.tabs);
      const tabs = await page.$$(this.selectors.tabs);
      
      for (const tab of tabs) {
        const text = await page.evaluate(el => el.textContent.trim(), tab);
        if (text.toLowerCase() === tabName.toLowerCase()) {
          await tab.click();
          return;
        }
      }
      
      throw new Error(`Tab ${tabName} not found`);
    } catch (error) {
      throw new Error(`Failed to click tab: ${error.message}`);
    }
  }

  /**
   * Get the breadcrumb trail
   * @returns {Promise<Array<string>>} Array of breadcrumb text
   */
  async getBreadcrumbs() {
    if (this.testMode === 'mock') {
      const url = await page.url();
      const productId = url.split('/').pop();
      const product = this.mockData.products.find(p => p.id === productId) || this.mockData.products[0];
      return ['Home', 'Products', product.category, product.name];
    }
    
    try {
      await page.waitForSelector(this.selectors.breadcrumbs);
      return page.$$eval(this.selectors.breadcrumbs + ' li', items => 
        items.map(item => item.textContent.trim())
      );
    } catch (error) {
      return []; // No breadcrumbs displayed
    }
  }

  /**
   * Check if the product is in stock
   * @returns {boolean} True if the product is in stock, false otherwise
   */
  async isInStock() {
    if (this.testMode === 'mock') {
      const url = await page.url();
      const productId = url.split('/').pop();
      const product = this.mockData.products.find(p => p.id === productId) || this.mockData.products[0];
      return product.stock > 0;
    }
    
    try {
      await page.waitForSelector(this.selectors.addToCartButton);
      const isDisabled = await page.evaluate(el => el.disabled, await page.$(this.selectors.addToCartButton));
      return !isDisabled;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get the number of related products
   * @returns {Promise<number>} Number of related products
   */
  async getRelatedProductsCount() {
    if (this.testMode === 'mock') {
      // Get the current product ID from the URL
      const url = await page.url();
      const currentProductId = url.split('/').pop();
      
      // Get products in the same category as the current product
      const currentProduct = this.mockData.products.find(p => p.id === currentProductId) || this.mockData.products[0];
      const relatedProducts = this.mockData.products.filter(p => 
        p.category === currentProduct.category && p.id !== currentProduct.id
      );
      
      return relatedProducts.length;
    }
    
    try {
      await page.waitForSelector(this.selectors.relatedProducts);
      return page.$$eval(this.selectors.relatedProductCards, cards => cards.length);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Click on a related product by index
   * @param {number} index - Index of the related product
   */
  async clickRelatedProduct(index) {
    if (this.testMode === 'mock') {
      // Get the current product ID from the URL
      const url = await page.url();
      const currentProductId = url.split('/').pop();
      
      // Get products in the same category as the current product
      const currentProduct = this.mockData.products.find(p => p.id === currentProductId) || this.mockData.products[0];
      const relatedProducts = this.mockData.products.filter(p => 
        p.category === currentProduct.category && p.id !== currentProduct.id
      );
      
      // Always succeed in mock mode by using a default product if needed
      const productToUse = index < relatedProducts.length ? relatedProducts[index] : this.mockData.products[0];
      await page.goto(`http://localhost:3000/products/${productToUse.id}`);
      console.log(`Clicked on related product ${productToUse.name} in mock mode`);
      return;
    }
    
    try {
      const relatedProducts = await page.$$(this.selectors.relatedProductCards);
      
      if (index >= 0 && index < relatedProducts.length) {
        await relatedProducts[index].click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
      } else {
        throw new Error(`Related product index ${index} out of bounds`);
      }
    } catch (error) {
      throw new Error(`Failed to click related product: ${error.message}`);
    }
  }

  /**
   * Get the stock count for the current product
   * @returns {Promise<number>} Stock count
   */
  async getStockCount() {
    if (this.testMode === 'mock') {
      // Get the current product ID from the URL
      const url = await page.url();
      const productId = url.split('/').pop();
      
      // Find the product in mock data
      const product = this.mockData.products.find(p => p.id === productId) || this.mockData.products[0];
      return product.stock || 0;
    }
    
    try {
      await page.waitForSelector(this.selectors.stockCount);
      const stockText = await page.$eval(this.selectors.stockCount, el => el.textContent.trim());
      const match = stockText.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    } catch (error) {
      return 0;
    }
  }
}

module.exports = ProductDetailPage;
