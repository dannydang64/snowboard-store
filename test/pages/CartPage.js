const BasePage = require('./BasePage');
const BaseTest = require('../framework/BaseTest');

/**
 * Page Object for the Shopping Cart page
 * Handles interactions with cart items, quantities, and checkout
 */
class CartPage extends BasePage {
  constructor() {
    super();
    this.baseTest = new BaseTest();
    this.testMode = this.baseTest.testMode;
    this.mockData = this.baseTest.mockData;
    
    // Selectors specific to the cart page
    this.selectors = {
      ...this.selectors,
      pageTitle: 'h1:contains("Shopping Cart")',
      cartItems: '.cart-item',
      productNames: '.cart-item h3',
      productPrices: '.cart-item .text-lg',
      quantityInputs: '.cart-item input[type="number"]',
      removeButtons: '.cart-item button:contains("Remove")',
      decreaseButtons: '.cart-item button:contains("-")',
      increaseButtons: '.cart-item button:contains("+")',
      subtotal: '.order-summary .text-lg:contains("Subtotal")',
      tax: '.order-summary .text-gray-600:contains("Tax")',
      total: '.order-summary .text-xl:contains("Total")',
      checkoutButton: 'a.btn-primary:contains("Proceed to Checkout")',
      emptyCartMessage: '.text-center:contains("Your cart is empty")',
      continueShoppingButton: 'a:contains("Continue Shopping")'
    };
  }

  /**
   * Navigate to the cart page
   */
  async navigate() {
    if (this.testMode === 'mock') {
      console.log('Navigating to cart page in mock mode');
      return;
    }
    
    await page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle0' });
  }

  /**
   * Get the number of items in the cart
   * @returns {Promise<number>} Number of items
   */
  async getItemCount() {
    if (this.testMode === 'mock') {
      return this.mockData.cart.items.length;
    }
    
    try {
      await page.waitForSelector(this.selectors.cartItems, { timeout: 2000 });
      const items = await page.$$(this.selectors.cartItems);
      return items.length;
    } catch (error) {
      // If no items are found, return 0
      return 0;
    }
  }

  /**
   * Get the names of products in the cart
   * @returns {Promise<Array<string>>} Array of product names
   */
  async getProductNames() {
    if (this.testMode === 'mock') {
      return this.mockData.cart.items.map(item => item.name);
    }
    
    try {
      await page.waitForSelector(this.selectors.productNames, { timeout: 2000 });
      return page.$$eval(this.selectors.productNames, elements => 
        elements.map(el => el.textContent.trim())
      );
    } catch (error) {
      return [];
    }
  }

  /**
   * Get the quantity of an item in the cart
   * @param {number} index - Index of the item
   * @returns {Promise<number>} Quantity of the item
   */
  async getItemQuantity(index) {
    if (this.testMode === 'mock') {
      if (index >= this.mockData.cart.items.length) {
        console.error(`Item at index ${index} not found in mock cart`);
        return 0;
      }
      return this.mockData.cart.items[index].quantity;
    }
    
    try {
      await page.waitForSelector(this.selectors.quantityInputs, { timeout: 2000 });
      const inputs = await page.$$(this.selectors.quantityInputs);
      if (index >= inputs.length) {
        throw new Error(`Item at index ${index} not found`);
      }
      
      const value = await page.evaluate(el => el.value, inputs[index]);
      return parseInt(value, 10);
    } catch (error) {
      console.error(`Error getting item quantity: ${error.message}`);
      return 0;
    }
  }

  /**
   * Update the quantity of an item in the cart
   * @param {number} index - Index of the item
   * @param {number} quantity - New quantity
   */
  async updateItemQuantity(index, quantity) {
    if (this.testMode === 'mock') {
      if (index >= this.mockData.cart.items.length) {
        console.error(`Item at index ${index} not found in mock cart`);
        return;
      }
      
      const productId = this.mockData.cart.items[index].id;
      this.mockData.cart.updateItem(productId, quantity);
      console.log(`Updated mock cart item ${productId} quantity to ${quantity}`);
      return;
    }
    
    try {
      await page.waitForSelector(this.selectors.quantityInputs, { timeout: 2000 });
      const inputs = await page.$$(this.selectors.quantityInputs);
      if (index >= inputs.length) {
        throw new Error(`Item at index ${index} not found`);
      }
      
      // Clear the input and type the new quantity
      await page.evaluate(el => el.value = '', inputs[index]);
      await inputs[index].type(quantity.toString());
      
      // Press Enter to submit
      await inputs[index].press('Enter');
      
      // Wait for the update to take effect
      await page.waitForTimeout(500);
    } catch (error) {
      console.error(`Error updating item quantity: ${error.message}`);
    }
  }

  /**
   * Increase the quantity of an item in the cart
   * @param {number} index - Index of the item
   */
  async increaseItemQuantity(index) {
    if (this.testMode === 'mock') {
      if (index >= this.mockData.cart.items.length) {
        console.error(`Item at index ${index} not found in mock cart`);
        return;
      }
      
      const productId = this.mockData.cart.items[index].id;
      this.mockData.cart.updateItem(productId, this.mockData.cart.items[index].quantity + 1);
      console.log(`Increased mock cart item ${productId} quantity`);
      return;
    }
    
    try {
      await page.waitForSelector(this.selectors.increaseButtons, { timeout: 2000 });
      const buttons = await page.$$(this.selectors.increaseButtons);
      if (index >= buttons.length) {
        throw new Error(`Item at index ${index} not found`);
      }
      
      // Click the increase button
      await buttons[index].click();
      
      // Wait for the update to take effect
      await page.waitForTimeout(500);
    } catch (error) {
      console.error(`Error increasing item quantity: ${error.message}`);
    }
  }

  /**
   * Decrease the quantity of an item in the cart
   * @param {number} index - Index of the item
   */
  async decreaseItemQuantity(index) {
    if (this.testMode === 'mock') {
      if (index >= this.mockData.cart.items.length) {
        console.error(`Item at index ${index} not found in mock cart`);
        return;
      }
      
      const productId = this.mockData.cart.items[index].id;
      this.mockData.cart.updateItem(productId, this.mockData.cart.items[index].quantity - 1);
      console.log(`Decreased mock cart item ${productId} quantity`);
      return;
    }
    
    try {
      await page.waitForSelector(this.selectors.decreaseButtons, { timeout: 2000 });
      const buttons = await page.$$(this.selectors.decreaseButtons);
      if (index >= buttons.length) {
        throw new Error(`Item at index ${index} not found`);
      }
      
      // Click the decrease button
      await buttons[index].click();
      
      // Wait for the update to take effect
      await page.waitForTimeout(500);
    } catch (error) {
      console.error(`Error decreasing item quantity: ${error.message}`);
    }
  }

  /**
   * Remove an item from the cart
   * @param {number} index - Index of the item
   */
  async removeItem(index) {
    if (this.testMode === 'mock') {
      if (index >= this.mockData.cart.items.length) {
        console.error(`Item at index ${index} not found in mock cart`);
        return;
      }
      
      const productId = this.mockData.cart.items[index].id;
      this.mockData.cart.removeItem(productId);
      console.log(`Removed item ${productId} from mock cart`);
      return;
    }
    
    try {
      await page.waitForSelector(this.selectors.removeButtons, { timeout: 2000 });
      const buttons = await page.$$(this.selectors.removeButtons);
      if (index >= buttons.length) {
        throw new Error(`Item at index ${index} not found`);
      }
      
      // Click the remove button
      await buttons[index].click();
      
      // Wait for the item to be removed
      await page.waitForTimeout(500);
    } catch (error) {
      console.error(`Error removing item: ${error.message}`);
    }
  }

  /**
   * Get the subtotal of the cart
   * @returns {Promise<number>} Subtotal
   */
  async getSubtotal() {
    if (this.testMode === 'mock') {
      // Calculate subtotal from mock cart items
      let subtotal = 0;
      for (const item of this.mockData.cart.items) {
        subtotal += item.price * item.quantity;
      }
      return subtotal;
    }
    
    try {
      await page.waitForSelector(this.selectors.subtotal, { timeout: 2000 });
      const subtotalText = await page.$eval(this.selectors.subtotal, el => el.textContent.trim());
      return parseFloat(subtotalText.replace(/[^0-9.]/g, ''));
    } catch (error) {
      console.error(`Error getting subtotal: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get the tax amount
   * @returns {Promise<number>} Tax amount
   */
  async getTax() {
    if (this.testMode === 'mock') {
      // Calculate tax as 8% of subtotal
      const subtotal = await this.getSubtotal();
      return subtotal * 0.08;
    }
    
    try {
      await page.waitForSelector(this.selectors.tax, { timeout: 2000 });
      const taxText = await page.$eval(this.selectors.tax, el => el.textContent.trim());
      return parseFloat(taxText.replace(/[^0-9.]/g, ''));
    } catch (error) {
      console.error(`Error getting tax: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get the total amount
   * @returns {Promise<number>} Total amount
   */
  async getTotal() {
    if (this.testMode === 'mock') {
      // Calculate total as subtotal + tax
      const subtotal = await this.getSubtotal();
      const tax = await this.getTax();
      return subtotal + tax;
    }
    
    try {
      await page.waitForSelector(this.selectors.total, { timeout: 2000 });
      const totalText = await page.$eval(this.selectors.total, el => el.textContent.trim());
      return parseFloat(totalText.replace(/[^0-9.]/g, ''));
    } catch (error) {
      console.error(`Error getting total: ${error.message}`);
      return 0;
    }
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout() {
    if (this.testMode === 'mock') {
      console.log('Proceeding to checkout in mock mode');
      await page.goto('http://localhost:3000/checkout');
      return;
    }
    
    await page.waitForSelector(this.selectors.checkoutButton);
    await Promise.all([
      page.click(this.selectors.checkoutButton),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
  }

  /**
   * Check if the cart is empty
   * @returns {Promise<boolean>} True if cart is empty
   */
  async isCartEmpty() {
    if (this.testMode === 'mock') {
      return this.mockData.cart.items.length === 0;
    }
    
    try {
      await page.waitForSelector(this.selectors.emptyCartMessage, { timeout: 2000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Continue shopping (navigate back to products page)
   */
  async continueShopping() {
    if (this.testMode === 'mock') {
      console.log('Continuing shopping in mock mode');
      await page.goto('http://localhost:3000/products');
      return;
    }
    
    await page.waitForSelector(this.selectors.continueShoppingButton);
    await Promise.all([
      page.click(this.selectors.continueShoppingButton),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
  }
}

module.exports = CartPage;
