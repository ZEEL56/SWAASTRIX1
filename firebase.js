// Firebase configuration
// Using Firebase Compat library (for static HTML)
// Your web app's Firebase configuration from Firebase Console

// Wait for Firebase SDK to load
if (typeof firebase === 'undefined') {
  console.error('❌ Firebase SDK not loaded! Make sure firebase-app-compat.js and firebase-auth-compat.js are loaded before firebase.js');
}

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGZf_cWbjN8F1C3YcOH7y6oy5ikce5NEc",
  authDomain: "swaastrix1.firebaseapp.com",
  projectId: "swaastrix1",
  storageBucket: "swaastrix1.firebasestorage.app",
  messagingSenderId: "206051217773",
  appId: "1:206051217773:web:579457810d40b725234a64",
  measurementId: "G-TK7JY7HW7S"
};

// Verify configuration
console.log("🔑 API KEY:", firebaseConfig.apiKey);
console.log("🌐 AUTH DOMAIN:", firebaseConfig.authDomain);
console.log("📦 PROJECT ID:", firebaseConfig.projectId);

// Initialize Firebase only if not already initialized
let app;
try {
  app = firebase.app();
} catch (e) {
  app = firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase Authentication and get a reference to the service
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Set additional OAuth parameters for better UX
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Make auth and googleProvider available globally
window.firebaseAuth = auth;
window.googleProvider = googleProvider;

console.log('✅ Firebase initialized successfully');
console.log('✅ Auth service ready:', !!auth);
console.log('✅ Google Provider ready:', !!googleProvider);

// STEP 5: QUICK CONFIRM TEST - Verify auth domain
console.log('🌐 Auth domain:', firebaseConfig.authDomain);
console.log('📋 Expected format: your-project.firebaseapp.com');
if (firebaseConfig.authDomain && firebaseConfig.authDomain !== 'YOUR_AUTH_DOMAIN') {
  console.log('✅ Auth domain configured correctly');
} else {
  console.warn('⚠️ Auth domain not configured - update firebase.js');
}
