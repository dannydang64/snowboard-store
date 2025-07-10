import { NextResponse } from 'next/server';

// Note: In a real application, this would be stored in a database
// For this mock application, we'll use server-side memory storage
// In production, you would use Firebase or another database
let orders = [];

// Helper function to generate a unique order ID
function generateOrderId() {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
}

//testing git commit

// Get orders
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  
  if (orderId) {
    const order = orders.find(o => o.orderId === orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  }
  
  // In a real app, you would filter by user ID
  return NextResponse.json(orders);
}

// Create new order
export async function POST(request) {
  const data = await request.json();
  const { 
    cartItems, 
    customerInfo, 
    shippingAddress, 
    billingAddress,
    paymentMethod,
    subtotal,
    tax,
    shipping,
    total
  } = data;
  
  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }
  
  if (!customerInfo || !shippingAddress || !paymentMethod) {
    return NextResponse.json({ error: 'Missing required order information' }, { status: 400 });
  }
  
  const newOrder = {
    orderId: generateOrderId(),
    date: new Date(),
    status: 'processing',
    items: cartItems,
    customerInfo,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    paymentMethod: {
      type: paymentMethod.type,
      // Don't store full payment details for security
      last4: paymentMethod.last4 || null
    },
    pricing: {
      subtotal,
      tax,
      shipping,
      total
    }
  };
  
  orders.push(newOrder);
  
  return NextResponse.json({
    success: true,
    orderId: newOrder.orderId,
    order: newOrder
  });
}

// Update order status
export async function PUT(request) {
  const data = await request.json();
  const { orderId, status } = data;
  
  const orderIndex = orders.findIndex(o => o.orderId === orderId);
  
  if (orderIndex === -1) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  
  // Validate status
  const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  
  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date();
  
  return NextResponse.json({
    success: true,
    order: orders[orderIndex]
  });
}
