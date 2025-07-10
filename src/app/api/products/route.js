import { products } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const id = searchParams.get('id');
  
  // Filter by ID if provided
  if (id) {
    const product = products.find(p => p.id === id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  }
  
  // Filter by category if provided
  if (category) {
    const filteredProducts = products.filter(p => p.category === category);
    return NextResponse.json(filteredProducts);
  }
  
  // Return all products if no filters
  return NextResponse.json(products);
}
