'use client';

import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Snow Ice</h3>
            <p className="text-gray-300">
              Your one-stop shop for premium snowboarding gear. Quality equipment for all skill levels.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products/category/snowboards" className="text-gray-300 hover:text-white">
                  Snowboards
                </Link>
              </li>
              <li>
                <Link href="/products/category/bindings" className="text-gray-300 hover:text-white">
                  Bindings
                </Link>
              </li>
              <li>
                <Link href="/products/category/boots" className="text-gray-300 hover:text-white">
                  Boots
                </Link>
              </li>
              <li>
                <Link href="/products/category/accessories" className="text-gray-300 hover:text-white">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-white">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-white">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <FaYoutube className="h-6 w-6" />
              </a>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Subscribe to our newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-3 py-2 text-black rounded-l-md focus:outline-none"
                />
                <button className="bg-secondary px-4 py-2 rounded-r-md hover:bg-secondary/90">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300">&copy; {new Date().getFullYear()} Snow Ice. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link href="/privacy" className="text-gray-300 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-white text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
