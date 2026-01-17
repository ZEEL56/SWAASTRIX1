# Google Sign-In Setup - Complete Guide

## ✅ STEP 1: FORCE POPUP (MOST IMPORTANT)

**✅ CORRECT - Using Popup (Current Implementation)**
```javascript
// ✅ This is what we're using - opens popup immediately
await window.firebaseAuth.signInWithPopup(window.googleProvider);
```

**❌ WRONG - Using Redirect (DO NOT USE)**
```javascript
// ❌ This causes handler page redirect - DO NOT USE
signInWithRedirect(auth, googleProvider);
```

**Status:** ✅ Your code is using `signInWithPopup` - CORRECT!

---

## ✅ STEP 2: AUTHORIZED DOMAINS (CRITICAL)

Firebase Console → Authentication → Settings → Authorized domains

**Add ALL of these domains:**

1. `localhost` (for local development)
2. `swaastrix1.firebaseapp.com` (your Firebase project domain)
3. `your-vercel-project.vercel.app` (if deployed to Vercel - replace with your actual domain)

**How to add:**
1. Go to Firebase Console
2. Select your project
3. Authentication → Settings tab
4. Scroll to "Authorized domains"
5. Click "Add domain"
6. Enter each domain (one at a time)
7. Click "Add"
8. Click "Save"

**⚠️ CRITICAL:** Without these domains, Google Sign-In will fail with "unauthorized-domain" error!

---

## ✅ STEP 3: CHECK BROWSER POPUP BLOCKER

Popup auth will fail silently if popups are blocked.

**Chrome:**
- Look for popup blocked icon in address bar
- Click it → "Always allow popups from this site"
- Or test in Incognito mode (popups usually allowed)

**Firefox:**
- Settings → Privacy & Security → Permissions → Block pop-up windows
- Add exception for your site

**Safari:**
- Safari → Settings → Websites → Pop-up Windows
- Allow for your domain

**Test:** Click "Sign in with Google" - popup should open immediately. If not, check popup blocker.

---

## ✅ STEP 4: DO NOT OPEN HANDLER URL MANUALLY

**❌ DO NOT open this URL manually:**
```
https://swaastrix1.firebaseapp.com/__/auth/handler
```

**Why?**
- This URL is used internally by Firebase
- Your app should never navigate to it directly
- It's only used by the popup flow internally

**Correct flow:**
1. Click "Sign in with Google" button
2. Google email chooser popup opens
3. User selects account
4. Popup closes automatically
5. Login completes (no redirect to handler page)

---

## ✅ STEP 5: QUICK CONFIRM TEST

**Check browser console (F12) for:**

```javascript
🌐 Auth domain: swaastrix1.firebaseapp.com
```

**Expected output:**
- ✅ `swaastrix1.firebaseapp.com` (or your project's domain)
- ❌ `YOUR_AUTH_DOMAIN` (not configured)
- ❌ `undefined` (config not loading)

**If wrong domain:**
1. Check `firebase.js` configuration
2. Verify you're using Web App config (not Android/iOS)
3. Restart dev server if using `.env.local`

---

## ✅ FINAL EXPECTED BEHAVIOR (AFTER FIX)

**When clicking "Sign in with Google":**

1. ✅ Button click logged: `🔵 Google Sign-In button clicked`
2. ✅ Console shows: `✅ Triggering Google Sign-In popup...`
3. ✅ Google email chooser opens **immediately** in popup
4. ✅ User selects Google account
5. ✅ Popup closes automatically
6. ✅ Console shows: `✅ Google Sign-In successful!`
7. ✅ User redirected to dashboard
8. ✅ **NO redirect page visible**
9. ✅ **NO handler URL visible**

---

## 🔍 Troubleshooting

### Issue: Popup doesn't open
**Check:**
- Browser popup blocker (Step 3)
- Console for errors
- Firebase config is correct

### Issue: "Unauthorized domain" error
**Fix:**
- Add domain to Firebase Console (Step 2)
- Wait a few minutes for propagation
- Clear browser cache

### Issue: "Operation not allowed" error
**Fix:**
- Enable Google Sign-In in Firebase Console
- Authentication → Sign-in method → Enable Google

### Issue: Handler page appears
**Fix:**
- You're using `signInWithRedirect` somewhere - remove it
- Use only `signInWithPopup` (already implemented)

### Issue: Wrong auth domain in console
**Fix:**
- Update `firebase.js` with correct Web App config
- Get config from: Firebase Console → Project Settings → Your apps → Web App

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] Using `signInWithPopup` (not redirect) ✅
- [ ] `localhost` added to authorized domains
- [ ] `swaastrix1.firebaseapp.com` added to authorized domains
- [ ] Vercel domain added (if deployed)
- [ ] Google Sign-In enabled in Firebase Console
- [ ] Browser popup blocker allows popups
- [ ] Console shows correct auth domain
- [ ] Firebase config has correct values (not "YOUR_API_KEY")

---

## 🎯 Quick Test

1. Open your app
2. Open browser console (F12)
3. Click "Sign in with Google"
4. **Expected:** Popup opens immediately with Google account selection
5. Select account
6. **Expected:** Popup closes, you're logged in, dashboard appears

**If popup doesn't open:** Check popup blocker (Step 3)
**If error appears:** Check console for specific error code and follow troubleshooting above

---

## 📝 Code Verification

Your current implementation is **CORRECT**:

```javascript
// ✅ Using popup (correct)
const result = await window.firebaseAuth.signInWithPopup(window.googleProvider);

// ❌ NOT using redirect (good - redirect would be wrong)
// signInWithRedirect is NOT in the code
```

**Status:** ✅ All good! Just need to configure Firebase Console settings.
