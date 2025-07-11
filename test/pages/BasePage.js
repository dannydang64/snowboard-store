/**
 * Base Page Object that all page objects will extend
 * Provides common functionality for interacting with pages
 */
class BasePage {
  constructor() {
    // Common selectors across pages
    this.selectors = {
      navigation: 'nav',
      logo: 'nav a.flex-shrink-0',
      cartIcon: 'a[href="/cart"]',
      cartCount: 'a[href="/cart"] span',
      footer: 'footer',
      footerLinks: 'footer a',
      categoryLinks: '.ml-10 a'
    };
  }

  /**
   * Navigate to the home page
   */
  async navigateToHome() {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  }

  /**
   * Get the page title
   * @returns {string} The page title
   */
  async getPageTitle() {
    return page.title();
  }

  /**
   * Check if the navigation menu is visible
   * @returns {boolean} True if the navigation menu is visible
   */
  async isNavigationVisible() {
    const navigation = await page.$(this.selectors.navigation);
    return navigation !== null;
  }

  /**
   * Get the cart count from the navigation
   * @returns {number} The cart count, or 0 if no count is displayed
   */
  async getCartCount() {
    try {
      const countText = await page.$eval(this.selectors.cartCount, el => el.textContent.trim());
      return parseInt(countText, 10);
    } catch (error) {
      // No cart count displayed (cart is empty)
      return 0;
    }
  }

  /**
   * Click on the cart icon to navigate to the cart page
   */
  async navigateToCart() {
    await page.click(this.selectors.cartIcon);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
  }

  /**
   * Navigate to a specific category
   * @param {string} category - The category name (snowboards, bindings, boots, accessories)
   */
  async navigateToCategory(category) {
    const categorySelector = `a[href="/products/category/${category.toLowerCase()}"]`;
    
    // Check if the category link is visible in the navigation
    const isCategoryVisible = await page.$(categorySelector) !== null;
    
    if (isCategoryVisible) {
      await page.click(categorySelector);
    } else {
      // Navigate directly if the link is not visible
      await page.goto(`http://localhost:3000/products/category/${category.toLowerCase()}`, { 
        waitUntil: 'networkidle0' 
      });
    }
  }

  /**
   * Check if the footer is visible
   * @returns {boolean} True if the footer is visible
   */
  async isFooterVisible() {
    const footer = await page.$(this.selectors.footer);
    return footer !== null;
  }

  /**
   * Get all category links from the navigation
   * @returns {Array<string>} Array of category names
   */
  async getCategoryLinks() {
    return page.$$eval(this.selectors.categoryLinks, links => {
      return links.map(link => {
        const href = link.getAttribute('href');
        const categoryMatch = href.match(/\/products\/category\/(.+)/);
        return categoryMatch ? categoryMatch[1] : null;
      }).filter(Boolean);
    });
  }
}

module.exports = BasePage;
