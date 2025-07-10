'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products?id=${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
        
        // Fetch related products
        const relatedResponse = await fetch(`/api/products?category=${data.category}`);
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedProducts(
            relatedData
              .filter(item => item.id !== data.id)
              .slice(0, 4)
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 10)) {
      setQuantity(value);
    }
  };

  const increaseQuantity = () => {
    if (quantity < (product?.stock || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const addToCart = () => {
    if (!product) return;
    
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingItemIndex = existingCart.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already in cart
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new product to cart
      existingCart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: quantity
      });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Dispatch event to notify components about cart update
    window.dispatchEvent(new Event('cartUpdated'));
    
    alert(`Added ${quantity} ${product.name} to your cart!`);
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400" />);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <main>
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main>
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="bg-red-100 text-red-700 p-6 rounded-md">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error || 'Product not found'}</p>
            <Link href="/products" className="mt-4 inline-block text-primary hover:underline">
              Back to all products
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-primary">
                Home
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li>
              <Link href="/products" className="text-gray-500 hover:text-primary">
                Products
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li>
              <Link href={`/products/category/${product.category}`} className="text-gray-500 hover:text-primary">
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-primary font-medium">{product.name}</li>
          </ol>
        </nav>
        
        {/* Back button */}
        <Link href="/products" className="inline-flex items-center text-primary hover:underline mb-6">
          <FaArrowLeft className="mr-2" /> Back to all products
        </Link>
        
        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="h-96 bg-gray-300 flex items-center justify-center">
              {/* Placeholder for actual images */}
              <span className="text-gray-500">{product.name} Image</span>
            </div>
          </div>
          
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex mr-2">
                {renderRatingStars(product.rating)}
              </div>
              <span className="text-gray-600">({product.reviews} reviews)</span>
            </div>
            
            <div className="text-2xl font-bold mb-6">${product.price.toFixed(2)}</div>
            
            <div className="mb-6">
              <p className="text-gray-700">{product.description}</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center">
                <span className="mr-4">Quantity:</span>
                <div className="flex items-center border rounded-md">
                  <button 
                    onClick={decreaseQuantity}
                    className="px-3 py-1 border-r"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 text-center py-1 border-none focus:outline-none"
                  />
                  <button 
                    onClick={increaseQuantity}
                    className="px-3 py-1 border-l"
                  >
                    +
                  </button>
                </div>
                <span className="ml-4 text-gray-600">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button 
                onClick={addToCart}
                disabled={product.stock <= 0}
                className={`btn-primary flex-1 flex items-center justify-center ${
                  product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaShoppingCart className="mr-2" />
                Add to Cart
              </button>
              <button className="btn-secondary flex-1">Buy Now</button>
            </div>
            
            {/* Product Metadata */}
            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                <span className="font-semibold w-32">Category:</span>
                <Link href={`/products/category/${product.category}`} className="text-primary hover:underline">
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                <span className="font-semibold w-32">SKU:</span>
                <span>{product.id}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <div className="mt-16">
          <div className="border-b">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'description'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'specifications'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reviews ({product.reviews})
              </button>
            </nav>
          </div>
          
          <div className="py-8">
            {activeTab === 'description' && (
              <div>
                <p className="text-gray-700 mb-6">{product.description}</p>
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                <ul className="list-disc pl-6 space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-gray-700">{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {activeTab === 'specifications' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 w-1/3">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center mb-6">
                  <div className="flex mr-2">
                    {renderRatingStars(product.rating)}
                  </div>
                  <span className="text-gray-700">{product.rating} out of 5</span>
                </div>
                
                <p className="text-gray-700 mb-8">
                  Based on {product.reviews} reviews
                </p>
                
                <div className="bg-gray-100 p-8 rounded-lg text-center">
                  <p className="text-gray-700 mb-4">
                    This is a mock application. In a real application, customer reviews would be displayed here.
                  </p>
                  <button className="btn-primary">Write a Review</button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <div key={relatedProduct.id} className="card group">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 relative">
                    <div className="h-64 bg-gray-300 flex items-center justify-center">
                      {/* Placeholder for actual images */}
                      <span className="text-gray-500">{relatedProduct.name} Image</span>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/products/${relatedProduct.id}`} className="bg-white text-primary font-semibold px-4 py-2 rounded">
                        Quick View
                      </Link>
                    </div>
                  </div>
                  <div className="p-5">
                    <Link href={`/products/${relatedProduct.id}`} className="block">
                      <h3 className="text-lg font-semibold mb-2 hover:text-primary">{relatedProduct.name}</h3>
                    </Link>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">${relatedProduct.price.toFixed(2)}</span>
                      <button className="btn-secondary">Add to Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  );
}
