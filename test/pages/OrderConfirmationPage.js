const BasePage = require('./BasePage');

/**
 * Page Object for the Order Confirmation page
 * Handles interactions with the order confirmation details
 */
class OrderConfirmationPage extends BasePage {
  constructor() {
    super();
    
    // Selectors specific to the order confirmation page
    this.selectors = {
      ...this.selectors,
      pageTitle: 'h1:contains("Order Confirmation")',
      orderNumber: '.order-number',
      orderDate: '.order-date',
      orderStatus: '.order-status',
      customerInfo: '.customer-info',
      shippingAddress: '.shipping-address',
      orderSummary: '.order-summary',
      orderItems: '.order-item',
      subtotal: '.text-lg:contains("Subtotal")',
      shipping: '.text-gray-600:contains("Shipping")',
      tax: '.text-gray-600:contains("Tax")',
      total: '.text-xl:contains("Total")',
      continueShoppingButton: 'a:contains("Continue Shopping")',
      printReceiptButton: 'button:contains("Print Receipt")'
    };
  }

  /**
   * Navigate to the order confirmation page with a specific order ID
   * @param {string} orderId - The order ID
   */
  async navigateWithOrderId(orderId) {
    await page.goto(`http://localhost:3000/order-confirmation?orderId=${orderId}`, { 
      waitUntil: 'networkidle0' 
    });
  }

  /**
   * Check if the order confirmation page is displayed
   * @returns {boolean} True if the order confirmation page is displayed
   */
  async isDisplayed() {
    try {
      await page.waitForSelector(this.selectors.pageTitle, { timeout: 3000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the order number
   * @returns {string} The order number
   */
  async getOrderNumber() {
    try {
      await page.waitForSelector(this.selectors.orderNumber);
      const orderNumberText = await page.$eval(this.selectors.orderNumber, el => el.textContent.trim());
      // Extract the order number from the text
      const match = orderNumberText.match(/([A-Z0-9-]+)/);
      return match ? match[1] : null;
    } catch (error) {
      return null; // No order number found
    }
  }

  /**
   * Get the order status
   * @returns {string} The order status
   */
  async getOrderStatus() {
    try {
      await page.waitForSelector(this.selectors.orderStatus);
      return page.$eval(this.selectors.orderStatus, el => el.textContent.trim());
    } catch (error) {
      return null; // No order status found
    }
  }

  /**
   * Get the number of items in the order
   * @returns {number} The number of order items
   */
  async getOrderItemCount() {
    try {
      await page.waitForSelector(this.selectors.orderItems);
      return page.$$eval(this.selectors.orderItems, items => items.length);
    } catch (error) {
      return 0; // No order items found
    }
  }

  /**
   * Get the order total
   * @returns {number} The order total as a number
   */
  async getOrderTotal() {
    try {
      await page.waitForSelector(this.selectors.total);
      const totalText = await page.$eval(this.selectors.total, el => el.textContent.trim());
      // Extract the number from the text (e.g., "Total: $549.98" -> 549.98)
      const match = totalText.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    } catch (error) {
      return 0; // No total displayed
    }
  }

  /**
   * Get the shipping address
   * @returns {string} The shipping address text
   */
  async getShippingAddress() {
    try {
      await page.waitForSelector(this.selectors.shippingAddress);
      return page.$eval(this.selectors.shippingAddress, el => el.textContent.trim());
    } catch (error) {
      return null; // No shipping address found
    }
  }

  /**
   * Click the "Continue Shopping" button
   */
  async continueShopping() {
    try {
      await page.waitForSelector(this.selectors.continueShoppingButton);
      
      // Click the button and wait for navigation
      await Promise.all([
        page.click(this.selectors.continueShoppingButton),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
      ]);
    } catch (error) {
      throw new Error(`Failed to continue shopping: ${error.message}`);
    }
  }

  /**
   * Verify order details match expected values
   * @param {Object} expectedDetails - Object containing expected order details
   * @param {string} expectedDetails.orderNumber - Expected order number
   * @param {string} expectedDetails.status - Expected order status
   * @param {number} expectedDetails.itemCount - Expected number of items
   * @param {number} expectedDetails.total - Expected order total
   * @returns {boolean} True if all details match expected values
   */
  async verifyOrderDetails(expectedDetails) {
    const orderNumber = await this.getOrderNumber();
    const status = await this.getOrderStatus();
    const itemCount = await this.getOrderItemCount();
    const total = await this.getOrderTotal();
    
    const matches = {
      orderNumber: !expectedDetails.orderNumber || orderNumber === expectedDetails.orderNumber,
      status: !expectedDetails.status || status === expectedDetails.status,
      itemCount: !expectedDetails.itemCount || itemCount === expectedDetails.itemCount,
      total: !expectedDetails.total || Math.abs(total - expectedDetails.total) < 0.01
    };
    
    return Object.values(matches).every(match => match === true);
  }
}

module.exports = OrderConfirmationPage;
