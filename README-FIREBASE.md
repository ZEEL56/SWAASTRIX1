# Firebase Google Sign-In Setup

## STEP 1: Get the CORRECT Firebase API Key

1. Open Firebase Console
2. Select your project
3. Go to **Project Settings**
4. Scroll to **Your apps**
5. If **Web App (</>)** does NOT exist → Click **Add app** → **Web**
6. Copy the config shown

⚠️ **Only use the WEB config** — not Android, not iOS

## STEP 2: FIX .env.local (MOST COMMON FAILURE)

Create or update `.env.local` in project root (same level as package.json):

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=XXXX
NEXT_PUBLIC_FIREBASE_APP_ID=1:XXXX:web:XXXX
```

### CRITICAL RULES
- ❌ NO quotes
- ❌ NO spaces
- ❌ NO commas
- ❌ NO semicolons

**For static HTML:** Update values directly in `firebase.js` instead of using env variables.

**For Next.js/React:** Use the `.env.local` file and restart the dev server.

## STEP 3: RESTART DEV SERVER (MANDATORY)

If you don't restart, Firebase still sees undefined.

```
Ctrl + C
npm run dev
```

## STEP 4: VERIFY KEY IS ACTUALLY LOADING

Check the browser console. The `firebase.js` file will log:
- `API KEY: AIzaSy...` ✅ → correct
- `API KEY: undefined` ❌ → env not loading
- `API KEY: YOUR_API_KEY` ❌ → not configured

Remove the console.log statements after testing.

## STEP 5: FIX VERCEL (If Deployed)

1. Vercel → Project → Settings → Environment Variables
2. Add ALL of these:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
3. Then: **Redeploy**

## STEP 6: ENABLE GOOGLE PROVIDER

Firebase Console → Authentication → Sign-in method → **Enable Google**

## STEP 7: AUTHORIZED DOMAINS

Firebase Console → Authentication → Settings → Authorized domains

Add:
- `localhost`
- `your-project.vercel.app`

## WHY THIS ERROR HAPPENS

| Mistake | Result |
|---------|--------|
| Wrong Firebase app | Invalid API key |
| Env not restarted | Undefined key |
| Vercel env missing | Works locally, fails live |
| Using Android/iOS key | Google popup fails |

## AFTER THIS — EXPECTED RESULT

- Click "Sign in with Google"
- Google email chooser opens instantly
- No error
- User object returned

## If It Still Fails

Check console for:
```javascript
console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
```

## Step 8: Firebase Console Settings (CRITICAL)

### Enable Google Sign-In:
1. Go to Firebase Console → Authentication → Sign-in method
2. Click on "Google"
3. Enable it
4. Save

### Add Authorized Domains:
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add:
   - `localhost`
   - `your-vercel-domain.vercel.app` (your actual Vercel domain)

**If this step is skipped → Google sign-in WILL FAIL**

## How It Works

- Clicking "Sign in with Google" immediately opens the Google email selection popup
- Uses `signInWithPopup` (not redirect) for instant popup
- No password rules or validation
- No backend required
- Works on localhost + Vercel

## Troubleshooting

- **Popup blocked:** Allow popups for this site in browser settings
- **Auth domain error:** Make sure you added your domain to Firebase authorized domains
- **Config error:** Verify all Firebase config values are correct in `firebase.js` or `.env.local`
