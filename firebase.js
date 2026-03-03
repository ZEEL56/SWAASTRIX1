// Firebase configuration
// Using Firebase Compat library (for static HTML)
// Your web app's Firebase configuration from Firebase Console
const idToken = await firebase.auth().currentUser.getIdToken();
const res = await fetch('http://localhost:5000/api/users/save', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  },
  body: JSON.stringify({ name, role }), // role: 'doctor' | 'patient' | 'admin'
});
// Wait for Firebase SDK to load
if (typeof firebase === 'undefined') {
  console.error('❌ Firebase SDK not loaded! Make sure firebase-app-compat.js and firebase-auth-compat.js are loaded before firebase.js');
}

// Your Firebase project configuration
// Initialize Firebase (Compat)
const firebaseConfig = {
  apiKey: "AIzaSyBGZf_cWbjN8F1C3YcOH7y6oy5ikce5NEc",
  authDomain: "swaastrix1.firebaseapp.com",
  projectId: "swaastrix1",
  storageBucket: "swaastrix1.firebasestorage.app",
  messagingSenderId: "206051217773",
  appId: "1:206051217773:web:579457810d40b725234a64",
  measurementId: "G-TK7JY7HW7S"
};

let app;
try {
  app = firebase.app();
} catch (e) {
  app = firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

window.firebaseAuth = auth;
window.googleProvider = googleProvider;