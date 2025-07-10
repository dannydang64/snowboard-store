'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthForm from '@/components/auth/AuthForm';
import { auth } from '@/lib/firebase';

export default function RegisterPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, redirect to account page
        router.push('/account');
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  return (
    <main>
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Create an Account</h1>
          <AuthForm mode="register" />
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
