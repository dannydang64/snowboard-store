/**
 * Test Configuration
 * Controls behavior of the test framework
 */
module.exports = {
  // Base URL for the application
  baseUrl: 'http://localhost:3000',
  
  // Test mode: 'live' or 'mock'
  // - 'live': Tests run against a live application
  // - 'mock': Tests run with mock data (no need for app to be running)
  testMode: process.env.TEST_MODE || 'mock',
  
  // Browser settings
  browser: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0,
    defaultViewport: {
      width: 1280,
      height: 720
    },
    args: [
      '--window-size=1280,720',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  },
  
  // API settings
  api: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 5000
  },
  
  // Performance thresholds (in milliseconds)
  performance: {
    pageLoad: {
      home: 1500,
      product: 1000,
      cart: 800,
      checkout: 1200
    },
    apiResponse: {
      products: 500,
      cart: 300,
      orders: 500
    },
    interaction: {
      addToCart: 300,
      updateQuantity: 200,
      checkout: 1000
    }
  },
  
  // Test data
  testData: {
    customer: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '555-123-4567',
      address: '123 Test St',
      city: 'Test City',
      state: 'CA',
      zip: '12345',
      country: 'US'
    },
    payment: {
      cardName: 'Test User',
      cardNumber: '4111111111111111',
      expiry: '12/25',
      cvv: '123'
    }
  }
};
