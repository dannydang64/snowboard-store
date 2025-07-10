'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthForm from '@/components/auth/AuthForm';
import { FaUser, FaShoppingBag, FaHeart, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    // Check if user is logged in using Firebase Auth
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser({
          email: currentUser.email,
          name: currentUser.displayName || currentUser.email.split('@')[0],
          photoURL: currentUser.photoURL,
          uid: currentUser.uid
        });
      } else {
        // If not logged in, redirect to login page
        router.push('/login');
      }
      setLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
    
    // Mock orders data
    setOrders([
      {
        id: 'ORD-123456',
        date: '2025-07-01',
        status: 'delivered',
        total: 749.97,
        items: [
          { name: 'Alpine Freestyle Snowboard', price: 499.99, quantity: 1 },
          { name: 'Pro Series Bindings', price: 249.98, quantity: 1 }
        ]
      },
      {
        id: 'ORD-789012',
        date: '2025-06-15',
        status: 'processing',
        total: 299.99,
        items: [
          { name: 'Mountain Explorer Boots', price: 299.99, quantity: 1 }
        ]
      }
    ]);
  }, []);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    readOnly
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <button className="mt-4 btn-primary">Update Password</button>
              </div>
              
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="NY"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="10001"
                    />
                  </div>
                </div>
                <button className="mt-4 btn-primary">Save Address</button>
              </div>
            </div>
          </div>
        );
      
      case 'orders':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Order History</h2>
            {orders.length === 0 ? (
              <div className="bg-gray-100 p-8 rounded-lg text-center">
                <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                <Link href="/products" className="btn-primary inline-block">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div>
                          <h3 className="text-lg font-medium">Order #{order.id}</h3>
                          <p className="text-gray-600 text-sm">Placed on {order.date}</p>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'delivered' 
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 py-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between py-2 border-b last:border-b-0">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">${item.price.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="px-6 py-3 bg-white border-t">
                      <Link href={`/orders/${order.id}`} className="text-primary hover:underline text-sm">
                        View Order Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'wishlist':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">My Wishlist</h2>
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <p className="text-gray-600 mb-4">Your wishlist is empty.</p>
              <Link href="/products" className="btn-primary inline-block">
                Start Shopping
              </Link>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Email Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="newsletter"
                        className="mr-3"
                        defaultChecked
                      />
                      <label htmlFor="newsletter">Subscribe to newsletter</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="orderUpdates"
                        className="mr-3"
                        defaultChecked
                      />
                      <label htmlFor="orderUpdates">Order status updates</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="promotions"
                        className="mr-3"
                        defaultChecked
                      />
                      <label htmlFor="promotions">Promotions and discounts</label>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="cookies"
                        className="mr-3"
                        defaultChecked
                      />
                      <label htmlFor="cookies">Allow cookies</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="tracking"
                        className="mr-3"
                        defaultChecked
                      />
                      <label htmlFor="tracking">Allow tracking for personalized recommendations</label>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4 text-red-600">Danger Zone</h3>
                  <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
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

  return (
    <main>
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        
        {!user ? (
          <div className="max-w-md mx-auto">
            <AuthForm />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                      <FaUser />
                    </div>
                    <div className="ml-4">
                      <h2 className="font-semibold">{user.name}</h2>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                </div>
                <nav className="p-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center px-4 py-3 rounded-md ${
                      activeTab === 'profile'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <FaUser className="mr-3" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center px-4 py-3 rounded-md ${
                      activeTab === 'orders'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <FaShoppingBag className="mr-3" />
                    <span>Orders</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`w-full flex items-center px-4 py-3 rounded-md ${
                      activeTab === 'wishlist'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <FaHeart className="mr-3" />
                    <span>Wishlist</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center px-4 py-3 rounded-md ${
                      activeTab === 'settings'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <FaCog className="mr-3" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-gray-100 rounded-md"
                  >
                    <FaSignOutAlt className="mr-3" />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-3">
              {renderTabContent()}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  );
}
