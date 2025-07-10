'use client';

import { useState } from 'react';
import { FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';

export default function AuthForm({ mode = 'login' }) {
  const [authMode, setAuthMode] = useState(mode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const validateForm = () => {
    if (authMode === 'register') {
      if (!formData.firstName || !formData.lastName) {
        setError('Please enter your first and last name');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, we would use Firebase Auth here
      // For this mock app, we'll simulate authentication
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (authMode === 'login') {
        // Simulate successful login
        localStorage.setItem('user', JSON.stringify({
          email: formData.email,
          name: 'Mock User'
        }));
        
        // Refresh the page to update auth state
        window.location.href = '/account';
      } else {
        // Simulate successful registration
        localStorage.setItem('user', JSON.stringify({
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`
        }));
        
        // Redirect to account page
        window.location.href = '/account';
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setError(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {authMode === 'login' ? 'Sign In to Your Account' : 'Create an Account'}
      </h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {authMode === 'register' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="firstName">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="lastName">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
        </div>
        
        {authMode === 'register' && (
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>
        )}
        
        {authMode === 'login' && (
          <div className="flex justify-end mb-6">
            <a href="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot your password?
            </a>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full btn-primary mb-4 flex justify-center items-center ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
          ) : null}
          {authMode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      
      <div className="relative flex items-center justify-center my-6">
        <div className="border-t border-gray-300 absolute w-full"></div>
        <div className="bg-white px-4 relative text-sm text-gray-500">
          Or continue with
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
          <FaFacebook className="mr-2" />
          Facebook
        </button>
        <button className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors">
          <FaGoogle className="mr-2" />
          Google
        </button>
      </div>
      
      <div className="text-center">
        <button 
          onClick={toggleAuthMode}
          className="text-primary hover:underline"
        >
          {authMode === 'login' 
            ? "Don't have an account? Sign up" 
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
