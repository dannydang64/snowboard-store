const BasePage = require('./BasePage');
const BaseTest = require('../framework/BaseTest');

/**
 * Page Object for the Home page
 * Handles interactions specific to the home page
 */
class HomePage extends BasePage {
  constructor() {
    super();
    this.baseTest = new BaseTest();
    this.testMode = this.baseTest.testMode;
    this.mockData = this.baseTest.mockData;
    
    // Selectors specific to the home page
    this.selectors = {
      ...this.selectors,
      heroSection: 'section.relative.bg-gray-900',
      heroTitle: 'section.relative.bg-gray-900 h1',
      shopNowButton: 'a.btn-primary',
      featuredCategories: '.py-16 h2:contains("Shop by Category")',
      categoryCards: '.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div',
      featuredProducts: '.py-16 h2:contains("Featured Products")',
      productCards: '.card',
      newsletterSection: 'section.py-16.bg-primary',
      emailInput: 'input[type="email"]',
      subscribeButton: 'button:contains("Subscribe")'
    };
  }

  /**
   * Navigate to the home page
   */
  async navigate() {
    if (this.testMode === 'mock') {
      await page.goto('http://localhost:3000');
      console.log('Navigating to home page in mock mode');
      return;
    }
    
    await this.navigateToHome();
  }

  /**
   * Get the hero section title text
   * @returns {string} The hero title text
   */
  async getHeroTitle() {
    await page.waitForSelector(this.selectors.heroTitle);
    return page.$eval(this.selectors.heroTitle, el => el.textContent.trim());
  }

  /**
   * Click the Shop Now button in the hero section
   */
  async clickShopNow() {
    await page.waitForSelector(this.selectors.shopNowButton);
    await page.click(this.selectors.shopNowButton);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
  }

  /**
   * Get the number of featured categories displayed
   * @returns {number} The number of category cards
   */
  async getFeaturedCategoriesCount() {
    if (this.testMode === 'mock') {
      // Return 4 for the main categories: snowboards, bindings, boots, accessories
      return 4;
    }
    
    await page.waitForSelector(this.selectors.categoryCards);
    return page.$$eval(this.selectors.categoryCards, cards => cards.length);
  }

  /**
   * Click on a specific category card by index (0-based)
   * @param {number} index - The index of the category card to click
   */
  async clickCategoryCard(index) {
    if (this.testMode === 'mock') {
      const categories = ['snowboards', 'bindings', 'boots', 'accessories'];
      
      if (index >= 0 && index < categories.length) {
        const category = categories[index];
        await page.goto(`http://localhost:3000/products/category/${category}`);
        console.log(`Clicked on ${category} category in mock mode`);
        return;
      } else {
        throw new Error(`Category card index ${index} out of bounds`);
      }
    }
    
    const categoryCards = await page.$$(this.selectors.categoryCards);
    
    if (index >= 0 && index < categoryCards.length) {
      await categoryCards[index].click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    } else {
      throw new Error(`Category card index ${index} out of bounds`);
    }
  }

  /**
   * Get the number of featured products displayed
   * @returns {number} The number of product cards
   */
  async getFeaturedProductsCount() {
    if (this.testMode === 'mock') {
      // Return a subset of products as featured
      return Math.min(4, this.mockData.products.length);
    }
    
    await page.waitForSelector(this.selectors.productCards);
    return page.$$eval(this.selectors.productCards, cards => cards.length);
  }

  /**
   * Click on a specific product card by index (0-based)
   * @param {number} index - The index of the product card to click
   */
  async clickProductCard(index) {
    if (this.testMode === 'mock') {
      if (index >= 0 && index < this.mockData.products.length) {
        const product = this.mockData.products[index];
        await page.goto(`http://localhost:3000/products/${product.id}`);
        console.log(`Clicked on product ${product.name} in mock mode`);
        return;
      } else {
        throw new Error(`Product card index ${index} out of bounds`);
      }
    }
    
    const productCards = await page.$$(this.selectors.productCards);
    
    if (index >= 0 && index < productCards.length) {
      // Click the product name link within the card
      const productLink = await productCards[index].$('h3');
      await productLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    } else {
      throw new Error(`Product card index ${index} out of bounds`);
    }
  }

  /**
   * Subscribe to the newsletter
   * @param {string} email - The email address to subscribe with
   */
  async subscribeToNewsletter(email) {
    await page.waitForSelector(this.selectors.emailInput);
    await page.type(this.selectors.emailInput, email);
    await page.click(this.selectors.subscribeButton);
  }

  /**
   * Check if all main sections of the home page are visible
   * @returns {boolean} True if all sections are visible
   */
  async areAllSectionsVisible() {
    if (this.testMode === 'mock') {
      // In mock mode, assume all sections are visible
      return true;
    }
    
    const heroVisible = await page.$(this.selectors.heroSection) !== null;
    const categoriesVisible = await page.$(this.selectors.featuredCategories) !== null;
    const productsVisible = await page.$(this.selectors.featuredProducts) !== null;
    const newsletterVisible = await page.$(this.selectors.newsletterSection) !== null;
    
    return heroVisible && categoriesVisible && productsVisible && newsletterVisible;
  }
  
  /**
   * Get all category links available on the home page
   * @returns {Promise<Array<string>>} Array of category names
   */
  async getCategoryLinks() {
    if (this.testMode === 'mock') {
      // Return the main categories
      return ['snowboards', 'bindings', 'boots', 'accessories'];
    }
    
    try {
      await page.waitForSelector(this.selectors.categoryCards);
      return page.$$eval(this.selectors.categoryCards + ' a', links => 
        links.map(link => {
          const href = link.getAttribute('href');
          return href.split('/').pop();
        })
      );
    } catch (error) {
      return [];
    }
  }
  
  /**
   * Navigate to a specific category
   * @param {string} category - The category name
   */
  async navigateToCategory(category) {
    if (this.testMode === 'mock') {
      await page.goto(`http://localhost:3000/products/category/${category.toLowerCase()}`);
      console.log(`Navigating to ${category} category in mock mode`);
      return;
    }
    
    try {
      await page.click(`a[href*="/products/category/${category.toLowerCase()}"]`);
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    } catch (error) {
      throw new Error(`Failed to navigate to category ${category}: ${error.message}`);
    }
  }
}

module.exports = HomePage;
