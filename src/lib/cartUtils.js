/**
 * Utility functions for cart management
 */

/**
 * Get the current cart from localStorage
 * @returns {Array} Cart items array
 */
export const getCart = () => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('cart') || '[]');
};

/**
 * Save cart to localStorage
 * @param {Array} cart - Cart items array
 */
export const saveCart = (cart) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cart', JSON.stringify(cart));
  // Dispatch event to notify components about cart update
  window.dispatchEvent(new Event('cartUpdated'));
};

/**
 * Add item to cart
 * @param {Object} product - Product to add
 * @param {number} quantity - Quantity to add
 */
export const addToCart = (product, quantity = 1) => {
  const cart = getCart();
  
  // Check if product already in cart
  const existingItemIndex = cart.findIndex(item => item.productId === product.id);
  
  if (existingItemIndex >= 0) {
    // Update quantity if product already in cart
    cart[existingItemIndex].quantity += quantity;
  } else {
    // Add new product to cart
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: quantity
    });
  }
  
  saveCart(cart);
  return cart;
};

/**
 * Update item quantity in cart
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 */
export const updateCartItemQuantity = (productId, quantity) => {
  if (quantity < 1) return removeFromCart(productId);
  
  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.productId === productId);
  
  if (itemIndex === -1) return cart;
  
  cart[itemIndex].quantity = quantity;
  saveCart(cart);
  return cart;
};

/**
 * Remove item from cart
 * @param {string} productId - Product ID to remove
 */
export const removeFromCart = (productId) => {
  const cart = getCart().filter(item => item.productId !== productId);
  saveCart(cart);
  return cart;
};

/**
 * Clear the entire cart
 */
export const clearCart = () => {
  saveCart([]);
  return [];
};

/**
 * Calculate cart totals
 * @returns {Object} Cart totals
 */
export const getCartTotals = () => {
  const cart = getCart();
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = subtotal > 0 ? 15 : 0; // Free shipping over $100 could be implemented here
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + shipping + tax;
  
  return {
    subtotal,
    shipping,
    tax,
    total,
    itemCount
  };
};
