/**
 * Global mock data store for tests
 * Provides a centralized location for mock data used across tests
 */
class MockDataStore {
  constructor() {
    // Initialize with default data
    this.currentUrl = 'http://localhost:3000';
    this.customer = null;
    this.selectors = {
      shippingAddress: '.shipping-address'
    };
    this.reset();
  }

  /**
   * Reset the mock data store to its initial state
   */
  reset() {
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
        id: 'sb-002',
        name: 'Mountain Explorer Snowboard',
        category: 'snowboards',
        price: 549.99,
        description: 'Versatile all-mountain snowboard for any terrain and condition.',
        features: ['All-mountain design', 'Carbon reinforcement', 'Sintered base'],
        specifications: {
          weight: '3.0 kg',
          dimensions: '159 x 26 cm',
          material: 'Carbon/Wood composite'
        },
        stock: 8,
        rating: 4.9,
        reviews: 32,
        image: '/images/products/snowboard2.jpg'
      },
      {
        id: 'sb-003',
        name: 'Powder King Snowboard',
        category: 'snowboards',
        price: 599.99,
        description: 'Specialized powder snowboard with superior float and control.',
        features: ['Wide nose', 'Tapered tail', 'Setback stance'],
        specifications: {
          weight: '3.2 kg',
          dimensions: '162 x 27 cm',
          material: 'Premium wood core'
        },
        stock: 5,
        rating: 4.7,
        reviews: 19,
        image: '/images/products/snowboard3.jpg'
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
        id: 'bd-002',
        name: 'Pro Carbon Bindings',
        category: 'bindings',
        price: 329.99,
        description: 'Professional-grade carbon fiber bindings for maximum response.',
        features: ['Carbon highback', 'Aluminum heelcup', 'Quick-adjust straps'],
        specifications: {
          weight: '0.8 kg',
          dimensions: '25 x 15 cm',
          material: 'Carbon fiber/Aluminum'
        },
        stock: 12,
        rating: 4.8,
        reviews: 24,
        image: '/images/products/bindings2.jpg'
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
        id: 'bt-002',
        name: 'Alpine Pro Boots',
        category: 'boots',
        price: 359.99,
        description: 'Professional alpine boots with superior support and response.',
        features: ['Dual-zone BOA system', 'Performance liner', 'Vibram outsole'],
        specifications: {
          weight: '1.3 kg',
          dimensions: '31 x 12 cm',
          material: 'Premium leather/Synthetic'
        },
        stock: 8,
        rating: 4.9,
        reviews: 27,
        image: '/images/products/boots2.jpg'
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
      },
      {
        id: 'ac-002',
        name: 'All-Weather Gloves',
        category: 'accessories',
        price: 79.99,
        description: 'Waterproof and breathable gloves for all weather conditions.',
        features: ['Waterproof membrane', 'Thermal insulation', 'Touchscreen compatible'],
        specifications: {
          weight: '0.2 kg',
          dimensions: 'S/M/L/XL',
          material: 'Gore-Tex/Leather'
        },
        stock: 25,
        rating: 4.5,
        reviews: 31,
        image: '/images/products/gloves1.jpg'
      },
      {
        id: 'ac-003',
        name: 'Winter Helmet',
        category: 'accessories',
        price: 149.99,
        description: 'Lightweight helmet with adjustable ventilation and audio compatibility.',
        features: ['MIPS technology', 'Adjustable vents', 'Audio compatible'],
        specifications: {
          weight: '0.5 kg',
          dimensions: 'S/M/L',
          material: 'ABS/EPS foam'
        },
        stock: 0, // Out of stock for testing
        rating: 4.8,
        reviews: 42,
        image: '/images/products/helmet1.jpg'
      }
    ];
    
    this.cart = {
      items: [],
      addItem: (product, quantity = 1) => {
        const existingItem = this.cart.items.find(item => item.id === product.id);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          this.cart.items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity
          });
        }
        return this.cart.items;
      },
      updateItem: (productId, quantity) => {
        const item = this.cart.items.find(item => item.id === productId);
        if (item) {
          if (quantity <= 0) {
            this.cart.removeItem(productId);
          } else {
            item.quantity = quantity;
          }
        }
        return this.cart.items;
      },
      removeItem: (productId) => {
        const index = this.cart.items.findIndex(item => item.id === productId);
        if (index !== -1) {
          this.cart.items.splice(index, 1);
        }
        return this.cart.items;
      },
      clear: () => {
        this.cart.items = [];
        return this.cart.items;
      },
      getSubtotal: () => {
        return this.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      getTax: () => {
        return this.cart.getSubtotal() * 0.08;
      },
      getTotal: () => {
        return this.cart.getSubtotal() + this.cart.getTax();
      }
    };
    
    this.orders = [];
    this.nextOrderId = 1000;
    
    this.currentUrl = 'mock://localhost';
  }

  /**
   * Get a product by ID
   * @param {string} productId - Product ID
   * @returns {Object} Product object
   */
  getProductById(productId) {
    return this.products.find(p => p.id === productId) || this.products[0];
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Object} Order object
   */
  createOrder(orderData) {
    const orderId = `order-${this.nextOrderId++}`;
    
    const order = {
      orderId,
      ...orderData,
      items: [...this.cart.items],
      subtotal: this.cart.getSubtotal(),
      tax: this.cart.getTax(),
      total: this.cart.getTotal(),
      status: 'processing',
      createdAt: new Date().toISOString()
    };
    
    this.orders.push(order);
    
    // Clear the cart after creating an order
    this.cart.clear();
    
    return order;
  }

  /**
   * Set the current URL
   * @param {string} url - URL
   */
  setCurrentUrl(url) {
    this.currentUrl = url;
  }

  /**
   * Get the current URL
   * @returns {string} Current URL
   */
  getCurrentUrl() {
    return this.currentUrl;
  }
}

// Create a singleton instance
const mockDataStore = new MockDataStore();

module.exports = mockDataStore;
