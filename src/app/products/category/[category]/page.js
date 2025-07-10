'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { FaFilter, FaSort, FaSearch } from 'react-icons/fa';

export default function CategoryPage() {
  const params = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sort: 'featured'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products?category=${params.category}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.category) {
      fetchProducts();
    }
  }, [params.category]);

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    if (filters.minPrice && product.price < parseFloat(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (filters.sort) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0; // Featured - use default order
    }
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const getCategoryName = () => {
    if (!params.category) return 'Products';
    return params.category.charAt(0).toUpperCase() + params.category.slice(1);
  };

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const addToCart = (product) => {
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingItemIndex = existingCart.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already in cart
      existingCart[existingItemIndex].quantity += 1;
    } else {
      // Add new product to cart
      existingCart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1
      });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Dispatch event to notify components about cart update
    window.dispatchEvent(new Event('cartUpdated'));
    
    alert(`Added ${product.name} to your cart!`);
  };

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
            <li className="text-primary font-medium">{getCategoryName()}</li>
          </ol>
        </nav>
        
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">{getCategoryName()}</h1>
          
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <button 
              onClick={toggleFilters}
              className="md:hidden flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
            >
              <FaFilter />
              <span>Filters</span>
            </button>
            
            <div className="relative flex-grow md:w-64">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <div className="hidden md:flex items-center space-x-2">
              <span>Sort by:</span>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="border rounded-md px-3 py-2"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters - Desktop */}
          <div className="hidden md:block w-64 bg-white p-6 rounded-lg shadow-md h-fit">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Price Range</h3>
              <div className="flex items-center">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className="w-full border rounded-md px-3 py-2 mr-2"
                />
                <span>-</span>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  className="w-full border rounded-md px-3 py-2 ml-2"
                />
              </div>
            </div>
            
            <button 
              onClick={() => setFilters({
                minPrice: '',
                maxPrice: '',
                sort: 'featured'
              })}
              className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-md"
            >
              Clear Filters
            </button>
          </div>

          {/* Filters - Mobile */}
          {showFilters && (
            <div className="md:hidden w-full bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={toggleFilters}>✕</button>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Price Range</h3>
                <div className="flex items-center">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-full border rounded-md px-3 py-2 mr-2"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-full border rounded-md px-3 py-2 ml-2"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Sort By</h3>
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="w-full border rounded-md px-3 py-2"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={() => {
                  setFilters({
                    minPrice: '',
                    maxPrice: '',
                    sort: 'featured'
                  });
                  setShowFilters(false);
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-md"
              >
                Apply Filters
              </button>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-grow">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 text-red-700 p-4 rounded-md">
                {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-gray-100 p-8 rounded-md text-center">
                <p className="text-lg">No products found in this category.</p>
                <Link href="/products" className="mt-4 text-primary hover:underline">
                  View all products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} className="card group">
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 relative">
                      <div className="h-64 relative">
                        <img 
                          src={product.images?.[0] || `/images/product-${product.category || 'snowboard'}-1.jpg`} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/products/${product.id}`} className="bg-white text-primary font-semibold px-4 py-2 rounded">
                          Quick View
                        </Link>
                      </div>
                    </div>
                    <div className="p-5">
                      <Link href={`/products/${product.id}`} className="block">
                        <h3 className="text-lg font-semibold mb-2 hover:text-primary">{product.name}</h3>
                      </Link>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                        <button 
                          className="btn-secondary"
                          onClick={() => addToCart(product)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
