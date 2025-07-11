const faker = require('faker');

/**
 * Helper class for managing test data
 * Provides methods for generating test data and managing test state
 */
class TestDataHelper {
  constructor() {
    // Set a fixed seed for reproducible test data
    faker.seed(12345);
    
    this.testData = {
      customers: [],
      orders: []
    };
  }

  /**
   * Generate a random customer
   * @returns {Object} Customer data
   */
  generateCustomer() {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    
    const customer = {
      firstName,
      lastName,
      email: faker.internet.email(firstName, lastName).toLowerCase(),
      phone: faker.phone.phoneNumber('###-###-####'),
      address: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode('#####'),
      country: 'US'
    };
    
    this.testData.customers.push(customer);
    return customer;
  }

  /**
   * Generate payment information
   * @param {boolean} valid - Whether to generate valid or invalid payment info
   * @returns {Object} Payment information
   */
  generatePaymentInfo(valid = true) {
    return {
      cardName: valid ? faker.name.findName() : '',
      cardNumber: valid ? '4111111111111111' : '1234567890123456',
      expiry: valid ? '12/25' : '00/00',
      cvv: valid ? '123' : 'abc'
    };
  }

  /**
   * Generate a random product
   * @param {string} category - The product category
   * @returns {Object} Product data
   */
  generateProduct(category = null) {
    const categories = ['snowboards', 'bindings', 'boots', 'accessories'];
    const selectedCategory = category || categories[Math.floor(Math.random() * categories.length)];
    
    return {
      id: `test-${faker.datatype.uuid()}`,
      name: `${faker.commerce.productAdjective()} ${selectedCategory.slice(0, -1)}`,
      category: selectedCategory,
      price: parseFloat(faker.commerce.price(99, 999)),
      description: faker.commerce.productDescription(),
      features: Array(5).fill().map(() => faker.commerce.productAdjective() + ' ' + faker.commerce.productMaterial()),
      specifications: {
        weight: `${faker.datatype.float({ min: 1, max: 5, precision: 0.1 })} kg`,
        dimensions: `${faker.datatype.number({ min: 10, max: 30 })} x ${faker.datatype.number({ min: 10, max: 30 })} cm`,
        material: faker.commerce.productMaterial()
      },
      stock: faker.datatype.number({ min: 0, max: 50 }),
      rating: faker.datatype.float({ min: 3, max: 5, precision: 0.1 }),
      reviews: faker.datatype.number({ min: 0, max: 100 })
    };
  }

  /**
   * Generate an order with random items
   * @param {Object} customer - Customer data
   * @param {number} itemCount - Number of items to include
   * @returns {Object} Order data
   */
  generateOrder(customer, itemCount = 2) {
    const items = Array(itemCount).fill().map(() => {
      const product = this.generateProduct();
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: faker.datatype.number({ min: 1, max: 5 })
      };
    });
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const shipping = 15;
    const total = subtotal + tax + shipping;
    
    const order = {
      customer,
      items,
      subtotal,
      tax,
      shipping,
      total,
      status: 'processing',
      createdAt: new Date().toISOString()
    };
    
    this.testData.orders.push(order);
    return order;
  }

  /**
   * Get a list of valid product IDs from the application
   * @returns {Array<string>} List of product IDs
   */
  getValidProductIds() {
    return [
      'sb-001', // Alpine Freestyle Snowboard
      'sb-002', // Mountain Explorer Snowboard
      'sb-003', // Powder Pro Snowboard
      'bd-001', // Performance Flex Bindings
      'bd-002', // All-Mountain Bindings
      'bt-001', // Comfort Tech Boots
      'bt-002', // Alpine Performance Boots
      'ac-001', // Winter Goggles Pro
      'ac-002'  // Slope Style Helmet
    ];
  }

  /**
   * Get a specific test product by ID
   * @param {string} productId - The product ID
   * @returns {Object} Product data or null if not found
   */
  getTestProduct(productId) {
    const productMap = {
      'sb-001': {
        id: 'sb-001',
        name: 'Alpine Freestyle Snowboard',
        category: 'snowboards',
        price: 499.99,
        stock: 15
      },
      'bd-001': {
        id: 'bd-001',
        name: 'Performance Flex Bindings',
        category: 'bindings',
        price: 249.99,
        stock: 20
      },
      'bt-001': {
        id: 'bt-001',
        name: 'Comfort Tech Boots',
        category: 'boots',
        price: 299.99,
        stock: 12
      },
      'ac-001': {
        id: 'ac-001',
        name: 'Winter Goggles Pro',
        category: 'accessories',
        price: 129.99,
        stock: 30
      }
    };
    
    return productMap[productId] || null;
  }

  /**
   * Clear all test data
   */
  clearTestData() {
    this.testData = {
      customers: [],
      orders: []
    };
  }
}

module.exports = TestDataHelper;
