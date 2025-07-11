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
   * Get the current quantity value
   * @returns {number} The current quantity value
   */
  async getQuantity() {
    await page.waitForSelector(this.selectors.quantityInput);
    const quantityText = await page.$eval(this.selectors.quantityInput, el => el.value);
    return parseInt(quantityText, 10);
  }

  /**
   * Set the quantity to a specific value
   * @param {number} quantity - The quantity to set
   */
  async setQuantity(quantity) {
    await page.waitForSelector(this.selectors.quantityInput);
    
    // Clear the input field
    await page.$eval(this.selectors.quantityInput, el => el.value = '');
    
    // Type the new quantity
    await page.type(this.selectors.quantityInput, quantity.toString());
  }

  /**
   * Increase the quantity by clicking the + button
   */
  async increaseQuantity() {
    await page.waitForSelector(this.selectors.increaseQuantityButton);
    await page.click(this.selectors.increaseQuantityButton);
  }

  /**
   * Decrease the quantity by clicking the - button
   */
  async decreaseQuantity() {
    await page.waitForSelector(this.selectors.decreaseQuantityButton);
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
    
    // Handle the alert
    try {
      await page.on('dialog', async dialog => {
        await dialog.accept();
      });
    } catch (error) {
      // Alert may have been handled already
    }
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
   * Get the stock information
   * @returns {number} The number of items in stock, or 0 if out of stock
   */
  async getStockCount() {
    try {
      await page.waitForSelector(this.selectors.stockInfo);
      const stockText = await page.$eval(this.selectors.stockInfo, el => el.textContent.trim());
      const match = stockText.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    } catch (error) {
      return 0; // Out of stock or stock info not displayed
    }
  }

  /**
   * Get the product rating
   * @returns {number} The product rating (0-5)
   */
  async getRating() {
    try {
      await page.waitForSelector(this.selectors.ratingStars);
      // Count the number of filled stars
      const filledStars = await page.$$eval(this.selectors.ratingStars, stars => {
        return stars.filter(star => !star.classList.contains('text-gray-300')).length;
      });
      return filledStars;
    } catch (error) {
      return 0; // No rating displayed
    }
  }

  /**
   * Get the number of reviews
   * @returns {number} The number of reviews
   */
  async getReviewCount() {
    try {
      await page.waitForSelector(this.selectors.reviewCount);
      const reviewText = await page.$eval(this.selectors.reviewCount, el => el.textContent.trim());
      const match = reviewText.match(/\((\d+)\s+reviews\)/);
      return match ? parseInt(match[1], 10) : 0;
    } catch (error) {
      return 0; // No reviews displayed
    }
  }

  /**
   * Switch to a different tab
   * @param {string} tabName - The name of the tab to switch to (description, specifications, reviews)
   */
  async switchTab(tabName) {
    const tabSelector = `button:contains("${tabName}")`;
    await page.waitForSelector(tabSelector);
    await page.click(tabSelector);
    
    // Wait for tab content to update
    await page.waitForTimeout(300);
  }

  /**
   * Get the number of related products
   * @returns {number} The number of related product cards
   */
  async getRelatedProductsCount() {
    try {
      await page.waitForSelector(this.selectors.relatedProductCards);
      return page.$$eval(this.selectors.relatedProductCards, cards => cards.length);
    } catch (error) {
      return 0; // No related products displayed
    }
  }

  /**
   * Click on a related product by index (0-based)
   * @param {number} index - The index of the related product to click
   */
  async clickRelatedProduct(index) {
    try {
      const relatedProducts = await page.$$(this.selectors.relatedProductCards);
      
      if (index >= 0 && index < relatedProducts.length) {
        // Click the product name link within the card
        const productLink = await relatedProducts[index].$('h3');
        await productLink.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
      } else {
        throw new Error(`Related product index ${index} out of bounds`);
      }
    } catch (error) {
      throw new Error(`Failed to click related product: ${error.message}`);
    }
  }

  /**
   * Get the breadcrumb trail
   * @returns {Array<string>} Array of breadcrumb text items
   */
  async getBreadcrumbs() {
    try {
      await page.waitForSelector(this.selectors.breadcrumbs);
      return page.$$eval(`${this.selectors.breadcrumbs} li`, items => 
        items.map(item => item.textContent.trim())
      );
    } catch (error) {
      return []; // No breadcrumbs displayed
    }
  }
}

module.exports = ProductDetailPage;
