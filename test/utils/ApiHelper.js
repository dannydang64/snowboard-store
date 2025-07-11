const MockServer = require('./MockServer');

/**
 * Helper class for API testing
 * Provides methods for interacting with the Snow Ice API endpoints
 * Uses a mock server for testing
 */
class ApiHelper {
  constructor() {
    this.mockServer = new MockServer();
  }

  /**
   * Get all products or filter by category or ID
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @param {string} params.id - Filter by product ID
   * @returns {Object} API response
   */
  getProducts(params = {}) {
    try {
      const response = this.mockServer.getProducts(params);
      if (response.status !== 200) {
        throw { message: response.data.error, status: response.status };
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error.message);
      throw error;
    }
  }

  /**
   * Get a specific product by ID
   * @param {string} productId - The product ID
   * @returns {Object} API response
   */
  getProductById(productId) {
    try {
      const response = this.mockServer.getProducts({ id: productId });
      if (response.status !== 200) {
        throw { message: response.data.error, status: response.status };
      }
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get products by category
   * @param {string} category - The category name
   * @returns {Array} API response
   */
  getProductsByCategory(category) {
    try {
      const response = this.mockServer.getProducts({ category });
      if (response.status !== 200) {
        throw { message: response.data.error, status: response.status };
      }
      return response.data;
    } catch (error) {
      console.error(`Error fetching products in category ${category}:`, error.message);
      throw error;
    }
  }

  /**
   * Get cart contents
   * @param {string} cartId - The cart ID
   * @returns {Object} API response
   */
  getCart(cartId) {
    try {
      const response = this.mockServer.getCart(cartId);
      if (response.status !== 200) {
        throw { message: response.data.error, status: response.status };
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error.message);
      throw error;
    }
  }

  /**
   * Add item to cart
   * @param {Object} cartItem - The cart item to add
   * @param {string} cartItem.cartId - The cart ID (optional)
   * @param {string} cartItem.productId - The product ID
   * @param {number} cartItem.quantity - The quantity
   * @returns {Object} API response
   */
  addToCart(cartItem) {
    try {
      const response = this.mockServer.addToCart(cartItem);
      if (response.status !== 200) {
        throw { message: response.data.error, status: response.status };
      }
      return response.data;
    } catch (error) {
      console.error('Error adding item to cart:', error.message);
      throw error;
    }
  }

  /**
   * Update cart item
   * @param {Object} cartItem - The cart item to update
   * @param {string} cartItem.cartId - The cart ID
   * @param {string} cartItem.productId - The product ID
   * @param {number} cartItem.quantity - The new quantity
   * @returns {Object} API response
   */
  updateCartItem(cartItem) {
    try {
      const response = this.mockServer.updateCartItem(cartItem);
      if (response.status !== 200) {
        throw { message: response.data.error, status: response.status };
      }
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error.message);
      throw error;
    }
  }

  /**
   * Remove item from cart
   * @param {string} cartId - The cart ID
   * @param {string} productId - The product ID
   * @returns {Object} API response
   */
  removeFromCart(cartId, productId) {
    try {
      const response = this.mockServer.removeFromCart(cartId, productId);
      if (response.status !== 200) {
        throw { message: response.data.error, status: response.status };
      }
      return response.data;
    } catch (error) {
      console.error('Error removing item from cart:', error.message);
      throw error;
    }
  }

  /**
   * Get all orders or a specific order
   * @param {string} orderId - The order ID (optional)
   * @returns {Object} API response
   */
  getOrders(orderId = null) {
    try {
      const response = this.mockServer.getOrders(orderId);
      if (response.status !== 200) {
        throw { message: response.data.error, status: response.status };
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error.message);
      throw error;
    }
  }

  /**
   * Create a new order
   * @param {Object} orderData - The order data
   * @returns {Object} API response
   */
  createOrder(orderData) {
    try {
      const response = this.mockServer.createOrder(orderData);
      if (response.status !== 200) {
        throw { message: response.data.error, status: response.status };
      }
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error.message);
      throw error;
    }
  }

  /**
   * Update order status
   * @param {string} orderId - The order ID
   * @param {string} status - The new status
   * @returns {Object} API response
   */
  updateOrderStatus(orderId, status) {
    try {
      const response = this.mockServer.updateOrderStatus(orderId, status);
      if (response.status !== 200) {
        throw { message: response.data.error, status: response.status };
      }
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error.message);
      throw error;
    }
  }
}

module.exports = ApiHelper;
