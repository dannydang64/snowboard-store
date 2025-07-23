/**
 * Data Manager
 * Handles test data generation, loading, and management
 * Provides consistent data access for tests
 */
const fs = require('fs').promises;
const path = require('path');
const TestConfig = require('../framework/TestConfig');

class DataManager {
  constructor() {
    this.testDataDir = TestConfig.get('testData.directory');
    this.cache = {};
  }

  /**
   * Load test data from a JSON file
   * @param {string} filename - Name of the JSON file (without .json extension)
   * @returns {Promise<Object>} The loaded test data
   */
  async loadTestData(filename) {
    if (this.cache[filename]) {
      return this.cache[filename];
    }

    try {
      const filePath = path.join(this.testDataDir, `${filename}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      const parsedData = JSON.parse(data);
      
      // Cache the data for future use
      this.cache[filename] = parsedData;
      
      return parsedData;
    } catch (error) {
      throw new Error(`Failed to load test data from ${filename}.json: ${error.message}`);
    }
  }

  /**
   * Get a specific product by ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} The product data
   */
  async getProduct(productId) {
    const products = await this.loadTestData('products');
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      throw new Error(`Product with ID ${productId} not found in test data`);
    }
    
    return product;
  }

  /**
   * Get products by category
   * @param {string} category - Product category
   * @returns {Promise<Array>} Array of products in the category
   */
  async getProductsByCategory(category) {
    const products = await this.loadTestData('products');
    return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  /**
   * Get test user data
   * @param {string} userType - Type of user (e.g., 'guest', 'registered')
   * @returns {Promise<Object>} The user data
   */
  async getUser(userType = 'guest') {
    const users = await this.loadTestData('users');
    const user = users.find(u => u.type === userType);
    
    if (!user) {
      throw new Error(`User type ${userType} not found in test data`);
    }
    
    return user;
  }

  /**
   * Get shipping information for checkout
   * @param {string} addressType - Type of address (e.g., 'valid', 'invalid')
   * @returns {Promise<Object>} The shipping information
   */
  async getShippingInfo(addressType = 'valid') {
    const addresses = await this.loadTestData('shipping');
    const address = addresses.find(a => a.type === addressType);
    
    if (!address) {
      throw new Error(`Address type ${addressType} not found in test data`);
    }
    
    return address;
  }

  /**
   * Get payment information for checkout
   * @param {string} cardType - Type of card (e.g., 'valid', 'expired')
   * @returns {Promise<Object>} The payment information
   */
  async getPaymentInfo(cardType = 'valid') {
    const payments = await this.loadTestData('payment');
    const payment = payments.find(p => p.type === cardType);
    
    if (!payment) {
      throw new Error(`Payment type ${cardType} not found in test data`);
    }
    
    return payment;
  }

  /**
   * Generate a random order ID
   * @returns {string} Random order ID
   */
  generateOrderId() {
    return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Generate random test data based on a template
   * @param {Object} template - Template object with placeholders
   * @returns {Object} Object with placeholders replaced with random values
   */
  generateRandomData(template) {
    const result = JSON.parse(JSON.stringify(template));
    
    const replacePlaceholders = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Replace placeholders with random values
          obj[key] = obj[key]
            .replace('{{randomString}}', this._generateRandomString(8))
            .replace('{{randomNumber}}', this._generateRandomNumber(1000, 9999))
            .replace('{{randomEmail}}', `test.${this._generateRandomString(8)}@example.com`)
            .replace('{{timestamp}}', Date.now());
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          replacePlaceholders(obj[key]);
        }
      }
    };
    
    replacePlaceholders(result);
    return result;
  }

  /**
   * Generate a random string
   * @param {number} length - Length of the string
   * @returns {string} Random string
   * @private
   */
  _generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Generate a random number within a range
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random number
   * @private
   */
  _generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Create test data files if they don't exist
   * @returns {Promise<void>}
   */
  async ensureTestDataExists() {
    try {
      await fs.mkdir(this.testDataDir, { recursive: true });
      
      // Define default test data files to create
      const defaultData = {
        'products.json': [
          {
            "id": "sb-001",
            "name": "Alpine Freestyle Snowboard",
            "category": "snowboards",
            "price": 399.99,
            "description": "Versatile all-mountain snowboard for freestyle riding",
            "image": "/images/snowboard1.jpg",
            "specs": {
              "length": "156cm",
              "width": "25cm",
              "flex": "Medium",
              "terrain": "All-Mountain"
            },
            "inStock": true
          },
          {
            "id": "sb-002",
            "name": "Powder Pro Snowboard",
            "category": "snowboards",
            "price": 499.99,
            "description": "Wide powder snowboard for deep snow days",
            "image": "/images/snowboard2.jpg",
            "specs": {
              "length": "162cm",
              "width": "26.5cm",
              "flex": "Medium-Stiff",
              "terrain": "Powder"
            },
            "inStock": true
          },
          {
            "id": "bd-001",
            "name": "Flex Bindings",
            "category": "bindings",
            "price": 199.99,
            "description": "Responsive bindings with medium flex",
            "image": "/images/bindings1.jpg",
            "specs": {
              "size": "M/L",
              "flex": "Medium",
              "entry": "Strap-In"
            },
            "inStock": true
          },
          {
            "id": "bt-001",
            "name": "All-Mountain Boots",
            "category": "boots",
            "price": 249.99,
            "description": "Comfortable boots for all-day riding",
            "image": "/images/boots1.jpg",
            "specs": {
              "size": "US 10",
              "flex": "Medium",
              "lacing": "BOA"
            },
            "inStock": true
          },
          {
            "id": "ac-001",
            "name": "Winter Goggles",
            "category": "accessories",
            "price": 89.99,
            "description": "Anti-fog goggles with UV protection",
            "image": "/images/goggles1.jpg",
            "specs": {
              "lensType": "Spherical",
              "uvProtection": "100%",
              "antiFog": true
            },
            "inStock": true
          }
        ],
        'users.json': [
          {
            "type": "guest",
            "email": "",
            "password": ""
          },
          {
            "type": "registered",
            "email": "test@example.com",
            "password": "Password123"
          }
        ],
        'shipping.json': [
          {
            "type": "valid",
            "firstName": "Test",
            "lastName": "User",
            "address": "123 Test St",
            "city": "Test City",
            "state": "CA",
            "zipCode": "12345",
            "country": "United States",
            "phone": "555-123-4567"
          },
          {
            "type": "invalid",
            "firstName": "Test",
            "lastName": "",
            "address": "123 Test St",
            "city": "Test City",
            "state": "CA",
            "zipCode": "invalid",
            "country": "United States",
            "phone": "invalid"
          }
        ],
        'payment.json': [
          {
            "type": "valid",
            "cardNumber": "4111111111111111",
            "cardName": "Test User",
            "expiryMonth": "12",
            "expiryYear": "2030",
            "cvv": "123"
          },
          {
            "type": "expired",
            "cardNumber": "4111111111111111",
            "cardName": "Test User",
            "expiryMonth": "01",
            "expiryYear": "2020",
            "cvv": "123"
          }
        ]
      };
      
      // Create each file if it doesn't exist
      for (const [filename, data] of Object.entries(defaultData)) {
        const filePath = path.join(this.testDataDir, filename);
        
        try {
          await fs.access(filePath);
          console.log(`Test data file ${filename} already exists`);
        } catch (error) {
          // File doesn't exist, create it
          await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
          console.log(`Created test data file ${filename}`);
        }
      }
    } catch (error) {
      console.error(`Error ensuring test data exists: ${error.message}`);
    }
  }
}

module.exports = new DataManager();
