/**
 * Mock Server for API tests
 * Provides mock responses for API endpoints
 */
class MockServer {
  constructor() {
    this.products = [
      {
        id: 'sb-001',
        name: 'Alpine Freestyle Snowboard',
        category: 'snowboards',
        price: 499.99,
        description: 'High-performance freestyle snowboard for all mountain conditions.',
        features: ['Responsive flex', 'Lightweight core', 'Durable construction'],
        specifications: {
          weight: '2.8 kg',
          dimensions: '156 x 25 cm',
          material: 'Carbon fiber'
        },
        stock: 15,
        rating: 4.8,
        reviews: 24,
        image: '/images/products/snowboard1.jpg'
      },
      {
        id: 'bd-001',
        name: 'Performance Flex Bindings',
        category: 'bindings',
        price: 249.99,
        description: 'Responsive bindings with adjustable flex for all riding styles.',
        features: ['Tool-free adjustment', 'Cushioned footbed', 'Lightweight design'],
        specifications: {
          weight: '0.9 kg',
          dimensions: '25 x 15 cm',
          material: 'Aluminum/Composite'
        },
        stock: 20,
        rating: 4.5,
        reviews: 18,
        image: '/images/products/bindings1.jpg'
      },
      {
        id: 'bt-001',
        name: 'Comfort Tech Boots',
        category: 'boots',
        price: 299.99,
        description: 'All-day comfort with advanced support and heat retention.',
        features: ['Quick-lace system', 'Heat-moldable liner', 'Impact absorption'],
        specifications: {
          weight: '1.2 kg',
          dimensions: '30 x 12 cm',
          material: 'Synthetic leather'
        },
        stock: 12,
        rating: 4.7,
        reviews: 15,
        image: '/images/products/boots1.jpg'
      },
      {
        id: 'ac-001',
        name: 'Winter Goggles Pro',
        category: 'accessories',
        price: 129.99,
        description: 'Anti-fog goggles with UV protection and wide field of view.',
        features: ['Anti-fog coating', 'Interchangeable lenses', 'Helmet compatible'],
        specifications: {
          weight: '0.3 kg',
          dimensions: '18 x 10 cm',
          material: 'Polycarbonate'
        },
        stock: 30,
        rating: 4.6,
        reviews: 22,
        image: '/images/products/goggles1.jpg'
      }
    ];
    
    this.carts = {};
    this.orders = {};
    this.nextOrderId = 1000;
  }

  /**
   * Get products
   * @param {Object} params - Query parameters
   * @returns {Object} Response object
   */
  getProducts(params = {}) {
    try {
      if (params.id) {
        const product = this.products.find(p => p.id === params.id);
        if (!product) {
          return {
            status: 404,
            data: { error: 'Product not found' }
          };
        }
        return {
          status: 200,
          data: product
        };
      }
      
      if (params.category) {
        const categoryProducts = this.products.filter(p => p.category === params.category);
        return {
          status: 200,
          data: categoryProducts
        };
      }
      
      return {
        status: 200,
        data: this.products
      };
    } catch (error) {
      return {
        status: 500,
        data: { error: 'Server error' }
      };
    }
  }

  /**
   * Get cart
   * @param {string} cartId - Cart ID
   * @returns {Object} Response object
   */
  getCart(cartId) {
    try {
      if (cartId && !this.carts[cartId]) {
        return {
          status: 404,
          data: { error: 'Cart not found' }
        };
      }
      
      if (!cartId) {
        // Create new cart
        cartId = `cart-${Date.now()}`;
        this.carts[cartId] = {
          cartId,
          items: []
        };
      }
      
      return {
        status: 200,
        data: this.carts[cartId]
      };
    } catch (error) {
      return {
        status: 500,
        data: { error: 'Server error' }
      };
    }
  }

  /**
   * Add item to cart
   * @param {Object} cartItem - Cart item
   * @returns {Object} Response object
   */
  addToCart(cartItem) {
    try {
      let { cartId, productId, quantity } = cartItem;
      
      if (!cartId) {
        // Create new cart
        cartId = `cart-${Date.now()}`;
        this.carts[cartId] = {
          cartId,
          items: []
        };
      } else if (!this.carts[cartId]) {
        return {
          status: 404,
          data: { error: 'Cart not found' }
        };
      }
      
      const product = this.products.find(p => p.id === productId);
      if (!product) {
        return {
          status: 404,
          data: { error: 'Product not found' }
        };
      }
      
      const cart = this.carts[cartId];
      const existingItem = cart.items.find(item => item.productId === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          productId,
          name: product.name,
          price: product.price,
          quantity
        });
      }
      
      return {
        status: 200,
        data: cart
      };
    } catch (error) {
      return {
        status: 500,
        data: { error: 'Server error' }
      };
    }
  }

  /**
   * Update cart item
   * @param {Object} cartItem - Cart item
   * @returns {Object} Response object
   */
  updateCartItem(cartItem) {
    try {
      const { cartId, productId, quantity } = cartItem;
      
      if (!this.carts[cartId]) {
        return {
          status: 404,
          data: { error: 'Cart not found' }
        };
      }
      
      const cart = this.carts[cartId];
      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (itemIndex === -1) {
        return {
          status: 404,
          data: { error: 'Item not found in cart' }
        };
      }
      
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      
      return {
        status: 200,
        data: cart
      };
    } catch (error) {
      return {
        status: 500,
        data: { error: 'Server error' }
      };
    }
  }

  /**
   * Remove item from cart
   * @param {string} cartId - Cart ID
   * @param {string} productId - Product ID
   * @returns {Object} Response object
   */
  removeFromCart(cartId, productId) {
    try {
      if (!this.carts[cartId]) {
        return {
          status: 404,
          data: { error: 'Cart not found' }
        };
      }
      
      const cart = this.carts[cartId];
      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (itemIndex === -1) {
        return {
          status: 404,
          data: { error: 'Item not found in cart' }
        };
      }
      
      cart.items.splice(itemIndex, 1);
      
      return {
        status: 200,
        data: cart
      };
    } catch (error) {
      return {
        status: 500,
        data: { error: 'Server error' }
      };
    }
  }

  /**
   * Get orders
   * @param {string} orderId - Order ID
   * @returns {Object} Response object
   */
  getOrders(orderId = null) {
    try {
      if (orderId) {
        if (!this.orders[orderId]) {
          return {
            status: 404,
            data: { error: 'Order not found' }
          };
        }
        
        return {
          status: 200,
          data: this.orders[orderId]
        };
      }
      
      return {
        status: 200,
        data: Object.values(this.orders)
      };
    } catch (error) {
      return {
        status: 500,
        data: { error: 'Server error' }
      };
    }
  }

  /**
   * Create order
   * @param {Object} orderData - Order data
   * @returns {Object} Response object
   */
  createOrder(orderData) {
    try {
      const orderId = `order-${this.nextOrderId++}`;
      
      const order = {
        orderId,
        ...orderData,
        status: 'processing',
        createdAt: new Date().toISOString()
      };
      
      this.orders[orderId] = order;
      
      return {
        status: 200,
        data: {
          success: true,
          order
        }
      };
    } catch (error) {
      return {
        status: 500,
        data: { error: 'Server error' }
      };
    }
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @returns {Object} Response object
   */
  updateOrderStatus(orderId, status) {
    try {
      if (!this.orders[orderId]) {
        return {
          status: 404,
          data: { error: 'Order not found' }
        };
      }
      
      const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return {
          status: 400,
          data: { error: 'Invalid status' }
        };
      }
      
      this.orders[orderId].status = status;
      
      return {
        status: 200,
        data: {
          success: true,
          order: this.orders[orderId]
        }
      };
    } catch (error) {
      return {
        status: 500,
        data: { error: 'Server error' }
      };
    }
  }
}

module.exports = MockServer;
