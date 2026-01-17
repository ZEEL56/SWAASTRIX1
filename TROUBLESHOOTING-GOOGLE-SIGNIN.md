# Google Sign-In Troubleshooting Guide

## Quick Diagnostic Steps

### 1. Check Browser Console
Open DevTools (F12) → Console tab and look for:

**✅ Good signs:**
```
✅ Firebase initialized successfully
✅ Auth service ready: true
✅ Google Provider ready: true
✅ Google Sign-In button handler attached
🔑 API KEY: AIzaSy... (your actual key)
```

**❌ Problems:**
```
❌ Firebase SDK not loaded!
❌ Firebase API Key not configured!
API KEY: YOUR_API_KEY (not configured)
API KEY: undefined (env not loading)
```

### 2. Common Issues & Fixes

#### Issue: "Firebase not initialized"
**Fix:**
1. Check `firebase.js` has correct config values
2. Make sure Firebase SDK scripts load before `firebase.js`
3. Check browser console for errors

#### Issue: "Invalid API Key" or "API key not valid"
**Fix:**
1. Get Web App config from Firebase Console (NOT Android/iOS)
2. Update `firebase.js` with correct values
3. Restart dev server if using `.env.local`

#### Issue: "Popup blocked"
**Fix:**
1. Allow popups in browser settings
2. Check browser popup blocker
3. Try in incognito/private mode

#### Issue: "Unauthorized domain"
**Fix:**
1. Firebase Console → Authentication → Settings
2. Add your domain to "Authorized domains":
   - `localhost` (for local testing)
   - `your-domain.vercel.app` (for Vercel)

#### Issue: "Operation not allowed"
**Fix:**
1. Firebase Console → Authentication → Sign-in method
2. Enable "Google" provider
3. Save

#### Issue: Button does nothing / No popup opens
**Check:**
1. Open console and click button - do you see "🔵 Google Sign-In button clicked"?
2. If yes → Firebase config issue
3. If no → Button handler not attached (check console for errors)

### 3. Manual Test

Open browser console and run:
```javascript
// Check if Firebase is loaded
console.log('Firebase:', typeof firebase !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');

// Check if auth is available
console.log('Auth:', window.firebaseAuth ? '✅ Available' : '❌ Not available');

// Check API key
console.log('API Key:', window.firebaseAuth?.app?.options?.apiKey);

// Try manual sign-in
if (window.firebaseAuth && window.googleProvider) {
  window.firebaseAuth.signInWithPopup(window.googleProvider)
    .then(result => console.log('✅ Success:', result.user.email))
    .catch(error => console.error('❌ Error:', error.code, error.message));
}
```

### 4. Configuration Checklist

- [ ] Firebase Web App created in Firebase Console
- [ ] Config values copied to `firebase.js` (or `.env.local` for Next.js)
- [ ] Google Sign-In enabled in Firebase Console
- [ ] Authorized domains added (localhost + your domain)
- [ ] Dev server restarted after config changes
- [ ] Browser console shows correct API key (not "YOUR_API_KEY")
- [ ] No errors in browser console

### 5. Still Not Working?

1. **Clear browser cache** and hard refresh (Ctrl+Shift+R)
2. **Check network tab** - are Firebase scripts loading?
3. **Try different browser** - rule out browser-specific issues
4. **Check Firebase project** - is it active? Any billing issues?
5. **Verify domain** - matches exactly in Firebase authorized domains

## Expected Behavior

When clicking "Sign in with Google":
1. Button click logged in console: "🔵 Google Sign-In button clicked"
2. Popup opens immediately with Google account selection
3. After selecting account, user is authenticated
4. Redirected to appropriate dashboard

If any step fails, check console for specific error message.
