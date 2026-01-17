# Fix "Domain Not Authorized" Error

## Quick Fix Steps

### Step 1: Identify Your Domain

Check your browser's address bar to see what domain you're using:
- `http://localhost:8080` → You need `localhost`
- `https://swaastrix1.web.app` → You need `swaastrix1.web.app`
- `https://swaastrix1.firebaseapp.com` → You need `swaastrix1.firebaseapp.com`
- `http://127.0.0.1:8080` → You need `127.0.0.1` (or use `localhost` instead)

### Step 2: Add Domain to Firebase Console

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project: **swaastrix1**

2. **Navigate to Authentication Settings**
   - Click **"Authentication"** in left sidebar
   - Click **"Settings"** tab (at the top, next to "Sign-in method")

3. **Add Authorized Domains**
   - Scroll down to **"Authorized domains"** section
   - You'll see a list of domains
   - Click **"Add domain"** button

4. **Add These Domains (One at a time)**
   
   **For Local Development:**
   - `localhost` (usually already there, but verify)
   - `127.0.0.1` (if you're using IP address)
   
   **For Firebase Hosting (if deployed):**
   - `swaastrix1.web.app`
   - `swaastrix1.firebaseapp.com`
   
   **For Custom Domain (if you have one):**
   - Your custom domain (e.g., `yourdomain.com`)

5. **Click "Add" for each domain**
6. **Click "Save"** (if there's a save button)

### Step 3: Wait a Few Minutes

After adding domains, wait 1-2 minutes for the changes to propagate.

### Step 4: Test Again

1. Refresh your app page
2. Clear browser cache (Ctrl+Shift+R)
3. Try "Sign in with Google" again

## Common Issues

### Issue: "localhost" is already there but still getting error
**Solution:**
- Make sure you're using `http://localhost:8080` (not `http://127.0.0.1:8080`)
- If using IP address, add `127.0.0.1` to authorized domains
- Try clearing browser cache

### Issue: Port number in URL
**Solution:**
- Firebase authorized domains don't include port numbers
- `localhost` covers all ports (8080, 3000, etc.)
- Just add `localhost` (without `:8080`)

### Issue: Still getting error after adding domain
**Solutions:**
1. Wait 2-3 minutes (propagation delay)
2. Clear browser cache completely
3. Try in incognito/private window
4. Check browser console for exact error message
5. Verify you're using the exact domain you added (case-sensitive)

## Quick Checklist

- [ ] Opened Firebase Console
- [ ] Went to Authentication → Settings
- [ ] Found "Authorized domains" section
- [ ] Added `localhost` (for local dev)
- [ ] Added `swaastrix1.web.app` (if deployed)
- [ ] Added `swaastrix1.firebaseapp.com` (if deployed)
- [ ] Waited 1-2 minutes
- [ ] Refreshed app page
- [ ] Tried Google Sign-In again

## Visual Guide

```
Firebase Console
└── Your Project (swaastrix1)
    └── Authentication
        └── Settings (tab)
            └── Authorized domains
                ├── localhost ✅
                ├── swaastrix1.firebaseapp.com ✅
                ├── swaastrix1.web.app ✅
                └── [Add domain] button
```

## Still Not Working?

Check the browser console (F12) for the exact error. It will tell you which domain is not authorized.

The error message will look like:
```
auth/unauthorized-domain: Domain [your-domain] is not authorized
```

Add that exact domain to Firebase Console.
