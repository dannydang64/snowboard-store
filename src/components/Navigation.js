'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaSignInAlt } from 'react-icons/fa';
import { auth } from '@/lib/firebase';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const pathname = usePathname();

  // Check authentication status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Get cart count from localStorage on client side
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.length);

    // Listen for cart updates
    const handleStorageChange = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(updatedCart.length);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Snowboards', path: '/products/category/snowboards' },
    { name: 'Bindings', path: '/products/category/bindings' },
    { name: 'Boots', path: '/products/category/boots' },
    { name: 'Accessories', path: '/products/category/accessories' }
  ];

  return (
    <nav className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 font-bold text-xl">
              SnowPeak
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === link.path
                      ? 'bg-secondary text-white'
                      : 'hover:bg-primary-700 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!authLoading && (
              user ? (
                <Link href="/account" className="text-white hover:text-gray-200" title={`Hello, ${user.displayName || 'User'}`}>
                  <FaUser className="h-6 w-6" />
                </Link>
              ) : (
                <Link href="/login" className="text-white hover:text-gray-200" title="Sign In">
                  <FaSignInAlt className="h-5 w-5" />
                </Link>
              )
            )}
            <Link href="/cart" className="relative">
              <FaShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link href="/cart" className="relative mr-4">
              <FaShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-700 focus:outline-none"
            >
              {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === link.path
                    ? 'bg-secondary text-white'
                    : 'hover:bg-primary-700 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {!authLoading && (
              user ? (
                <Link
                  href="/account"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-700 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <FaUser className="mr-2" />
                    My Account
                  </div>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-700 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <FaSignInAlt className="mr-2" />
                    Sign In
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
