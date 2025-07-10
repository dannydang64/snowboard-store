import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

export default function Home() {
  // Featured categories for the homepage
  const featuredCategories = [
    {
      name: 'Snowboards',
      image: '/images/category-snowboards.jpg',
      path: '/products/category/snowboards',
      description: 'Find the perfect board for your riding style'
    },
    {
      name: 'Bindings',
      image: '/images/category-bindings.jpg',
      path: '/products/category/bindings',
      description: 'Secure your connection to the board'
    },
    {
      name: 'Boots',
      image: '/images/category-boots.jpg',
      path: '/products/category/boots',
      description: 'Comfort and control for all-day riding'
    },
    {
      name: 'Accessories',
      image: '/images/category-accessories.jpg',
      path: '/products/category/accessories',
      description: 'Essential gear for the mountain'
    }
  ];

  // Featured products for the homepage
  const featuredProducts = [
    {
      id: '1',
      name: 'Alpine Freestyle Snowboard',
      price: 499.99,
      image: '/images/product-snowboard-1.jpg',
      category: 'snowboards',
      rating: 4.8
    },
    {
      id: '2',
      name: 'Pro Series Bindings',
      price: 249.99,
      image: '/images/product-bindings-1.jpg',
      category: 'bindings',
      rating: 4.7
    },
    {
      id: '3',
      name: 'Mountain Explorer Boots',
      price: 299.99,
      image: '/images/product-boots-1.jpg',
      category: 'boots',
      rating: 4.9
    },
    {
      id: '4',
      name: 'Winter Goggles Pro',
      price: 129.99,
      image: '/images/product-goggles-1.jpg',
      category: 'accessories',
      rating: 4.6
    }
  ];

  return (
    <main>
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: "url('/images/category-snowboards.jpg')" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Gear Up for the Perfect Ride</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl">
            Premium snowboarding equipment for every level, from beginners to pros.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products" className="btn-primary text-lg px-8 py-3">
              Shop Now
            </Link>
            <Link href="/size-guide" className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-semibold text-lg px-8 py-3 rounded transition-colors">
              Size Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredCategories.map((category) => (
              <Link 
                href={category.path} 
                key={category.name}
                className="card group overflow-hidden"
              >
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 relative">
                  <div className="h-64 bg-gray-300 relative">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-semibold text-lg">View Products</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <span className="text-primary flex items-center font-medium">
                    Shop Now <FaArrowRight className="ml-2" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link href="/products" className="text-primary font-medium flex items-center">
              View All <FaArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="card group">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 relative">
                  <div className="h-64 bg-gray-300 relative">
                    <img 
                      src={product.image} 
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
                    <button className="btn-secondary">Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Sign up for our newsletter to receive exclusive offers, early access to new products, and expert tips for your snowboarding adventures.
          </p>
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-l-md focus:outline-none text-black"
            />
            <button className="bg-accent hover:bg-accent/90 text-white font-semibold px-6 py-3 rounded-r-md transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
