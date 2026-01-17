# How to Enable Google Sign-In in Firebase Console

## Step-by-Step Instructions

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com
2. Sign in with your Google account
3. Select your project (or create a new one if needed)

### Step 2: Navigate to Authentication
1. In the left sidebar, click on **"Authentication"** (or "Build" → "Authentication" if using the new layout)
2. You should see the Authentication dashboard

### Step 3: Enable Google Sign-In Provider
1. Click on the **"Sign-in method"** tab (at the top of the Authentication page)
2. You'll see a list of sign-in providers
3. Find **"Google"** in the list
4. Click on **"Google"** to open its settings

### Step 4: Enable and Configure
1. Toggle the **"Enable"** switch to ON (it should turn blue/green)
2. You'll see a form with:
   - **Project support email**: Select your email (usually auto-filled)
   - **Project public-facing name**: Your project name (usually auto-filled)
3. Click **"Save"** at the bottom

### Step 5: Verify It's Enabled
- You should see a green checkmark or "Enabled" status next to Google
- The Google provider should now show as active in the list

## Step 6: Add Authorized Domains (CRITICAL!)

This step is essential - without it, Google Sign-In will fail!

1. Still in Authentication, click on the **"Settings"** tab (next to "Sign-in method")
2. Scroll down to **"Authorized domains"** section
3. You'll see some domains already listed (like your Firebase project domain)
4. Click **"Add domain"** button
5. Add these domains:
   - `localhost` (for local development)
   - `your-project.vercel.app` (if deploying to Vercel - replace with your actual domain)
   - Any other domains where you'll host the app
6. Click **"Add"** for each domain

### Important Notes:
- `localhost` is usually already there, but verify it exists
- For Vercel: Add your actual Vercel deployment URL
- Domains must match exactly (including http/https, www/non-www)

## Verification Checklist

After enabling, verify:
- [ ] Google shows as "Enabled" in Sign-in method list
- [ ] Authorized domains include `localhost`
- [ ] Authorized domains include your deployment domain (if applicable)
- [ ] No error messages in Firebase Console

## Common Issues

### Issue: "Google" option not visible
**Solution:** Make sure you're in the correct project and have proper permissions

### Issue: Can't enable Google
**Solution:** 
- Check if you're the project owner/admin
- Verify your Firebase project is active (not suspended)
- Try refreshing the page

### Issue: Authorized domain error
**Solution:**
- Make sure domain is added exactly as it appears in your browser
- For localhost, use just `localhost` (not `localhost:8080`)
- Wait a few minutes after adding domain (propagation delay)

## After Enabling

Once Google Sign-In is enabled:
1. Your app code is already configured to use it
2. Test by clicking "Sign in with Google" button
3. Google account selection popup should appear
4. After selecting account, you should be logged in

## Quick Test

After enabling, you can test in your app:
1. Open your app in browser
2. Open browser console (F12)
3. Click "Sign in with Google"
4. Check console for any errors
5. Popup should open with Google account selection

If you see "Operation not allowed" error → Google provider is not enabled
If you see "Unauthorized domain" error → Domain not added to authorized domains

---

**Need Help?** Check the browser console for specific error messages - they'll tell you exactly what's wrong.
