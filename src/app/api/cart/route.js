import { NextResponse } from 'next/server';
import { products } from '@/lib/data';

// Note: In a real application, this would be stored in a database
// For this mock application, we'll use server-side memory storage
// In production, you would use Firebase or another database
let carts = {};

// Helper function to generate a unique cart ID
function generateCartId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Get cart contents
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cartId = searchParams.get('cartId');
  
  if (!cartId || !carts[cartId]) {
    // Create a new cart if none exists
    const newCartId = generateCartId();
    carts[newCartId] = { items: [], createdAt: new Date() };
    return NextResponse.json({ cartId: newCartId, items: [] });
  }
  
  return NextResponse.json({ cartId, items: carts[cartId].items });
}

// Add item to cart
export async function POST(request) {
  const data = await request.json();
  const { cartId, productId, quantity = 1 } = data;
  
  // Validate product exists
  const product = products.find(p => p.id === productId);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  
  // Create cart if it doesn't exist
  if (!cartId || !carts[cartId]) {
    const newCartId = generateCartId();
    carts[newCartId] = { 
      items: [], 
      createdAt: new Date() 
    };
    
    // Add item to new cart
    carts[newCartId].items.push({
      productId,
      quantity,
      name: product.name,
      price: product.price,
      image: product.images[0]
    });
    
    return NextResponse.json({ 
      cartId: newCartId, 
      items: carts[newCartId].items 
    });
  }
  
  // Check if product already in cart
  const existingItemIndex = carts[cartId].items.findIndex(item => item.productId === productId);
  
  if (existingItemIndex >= 0) {
    // Update quantity if product already in cart
    carts[cartId].items[existingItemIndex].quantity += quantity;
  } else {
    // Add new product to cart
    carts[cartId].items.push({
      productId,
      quantity,
      name: product.name,
      price: product.price,
      image: product.images[0]
    });
  }
  
  return NextResponse.json({ 
    cartId, 
    items: carts[cartId].items 
  });
}

// Update cart item
export async function PUT(request) {
  const data = await request.json();
  const { cartId, productId, quantity } = data;
  
  if (!cartId || !carts[cartId]) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }
  
  const itemIndex = carts[cartId].items.findIndex(item => item.productId === productId);
  
  if (itemIndex === -1) {
    return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
  }
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    carts[cartId].items.splice(itemIndex, 1);
  } else {
    // Update quantity
    carts[cartId].items[itemIndex].quantity = quantity;
  }
  
  return NextResponse.json({ 
    cartId, 
    items: carts[cartId].items 
  });
}

// Delete item from cart
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const cartId = searchParams.get('cartId');
  const productId = searchParams.get('productId');
  
  if (!cartId || !carts[cartId]) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }
  
  if (productId) {
    // Remove specific item
    carts[cartId].items = carts[cartId].items.filter(item => item.productId !== productId);
  } else {
    // Clear entire cart
    carts[cartId].items = [];
  }
  
  return NextResponse.json({ 
    cartId, 
    items: carts[cartId].items 
  });
}
