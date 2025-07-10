// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7gGidhJYXa1P53LCqTVOBdZ0LxaRxxH4",
  authDomain: "snowboard-store-413e3.firebaseapp.com",
  projectId: "snowboard-store-413e3",
  storageBucket: "snowboard-store-413e3.firebasestorage.app",
  messagingSenderId: "847451115384",
  appId: "1:847451115384:web:74689dd159f858a4b7828d",
  measurementId: "G-8DQZVTVZHH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics - only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// For development purposes, you can enable this to use Firebase emulators
// but for now we'll use the real Firebase service with just email/password auth

// Important: Make sure to enable Email/Password authentication in the Firebase Console
// 1. Go to https://console.firebase.google.com/
// 2. Select your project: "snowboard-store-413e3"
// 3. Click on Authentication in the left sidebar
// 4. Click on the "Sign-in method" tab
// 5. Enable Email/Password provider

export { db, auth, analytics };
