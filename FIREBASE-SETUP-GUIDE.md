# Firebase Setup - Quick Reference

## ✅ STEP 1: Get Firebase Web App Config

1. Firebase Console → Your Project → **Project Settings**
2. Scroll to **Your apps** section
3. If no Web App exists → Click **Add app** → **Web (</>)**
4. Copy the config object shown

⚠️ **CRITICAL:** Only use **Web App** config, NOT Android or iOS!

## ✅ STEP 2: Configure .env.local

Create `.env.local` in project root (same level as `package.json`):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=XXXX
NEXT_PUBLIC_FIREBASE_APP_ID=1:XXXX:web:XXXX
```

### ⚠️ CRITICAL RULES:
- ❌ **NO quotes** around values
- ❌ **NO spaces** around `=`
- ❌ **NO commas**
- ❌ **NO semicolons**

**Example:**
```env
# ✅ CORRECT
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAbCdEf123456

# ❌ WRONG
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyAbCdEf123456"
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyAbCdEf123456
```

## ✅ STEP 3: RESTART DEV SERVER

**MANDATORY** - Environment variables only load on server start!

```bash
# Stop server
Ctrl + C

# Restart
npm run dev
```

## ✅ STEP 4: Verify API Key is Loading

Open browser console and check for:

```
API KEY: AIzaSy...  ✅ Correct!
API KEY: undefined  ❌ Env not loading
API KEY: YOUR_API_KEY  ❌ Not configured
```

If you see `undefined` or `YOUR_API_KEY`:
1. Check `.env.local` exists and has correct values
2. Restart dev server
3. For static HTML: Update values directly in `firebase.js`

## ✅ STEP 5: Vercel Deployment (If Applicable)

1. Vercel Dashboard → Your Project → **Settings**
2. Go to **Environment Variables**
3. Add all 6 variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. Click **Save**
5. **Redeploy** your project

## ✅ STEP 6: Enable Google Sign-In Provider

1. Firebase Console → **Authentication**
2. Click **Sign-in method** tab
3. Find **Google** in the list
4. Click **Enable**
5. Save

## ✅ STEP 7: Add Authorized Domains

1. Firebase Console → **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Click **Add domain**
4. Add:
   - `localhost`
   - `your-project.vercel.app` (your actual Vercel domain)

**If you skip this step → Google Sign-In WILL FAIL!**

## 🎯 Expected Result

After completing all steps:
- Click "Sign in with Google" button
- Google email chooser popup opens **instantly**
- No errors in console
- User successfully authenticated

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| `API KEY: undefined` | Restart dev server after adding `.env.local` |
| Popup blocked | Allow popups in browser settings |
| "Invalid API key" | Verify you're using **Web App** config, not Android/iOS |
| Works locally, fails on Vercel | Add env variables in Vercel dashboard and redeploy |
| "Auth domain not authorized" | Add domain to Firebase Authorized domains |

## 📝 For Static HTML (Current Setup)

Since this is currently a static HTML file, you have two options:

### Option A: Direct Config (Easiest)
Edit `firebase.js` and replace the placeholder values directly:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXX",  // Replace with your actual key
  authDomain: "your-project.firebaseapp.com",
  // ... etc
};
```

### Option B: Use Build Tool
Use a build tool (like Vite, Webpack) that can inject environment variables.

---

**After setup, remove the console.log statements from `firebase.js` for production.**
