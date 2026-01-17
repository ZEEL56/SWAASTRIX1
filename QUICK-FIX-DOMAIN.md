# Quick Fix: Domain Not Authorized

## ⚡ Fast Solution (2 minutes)

### Step 1: Open Firebase Console
Go to: https://console.firebase.google.com/project/swaastrix1/authentication/settings

### Step 2: Add Your Domain
1. Scroll down to **"Authorized domains"**
2. Click **"Add domain"**
3. **If testing locally:** Add `localhost`
4. **If deployed:** Add `swaastrix1.web.app` and `swaastrix1.firebaseapp.com`
5. Click **"Add"** for each
6. Wait 1 minute

### Step 3: Test
Refresh your app and try Google Sign-In again.

---

## What Domain to Add?

**Check your browser address bar:**

| URL You See | Domain to Add |
|-------------|---------------|
| `http://localhost:8080` | `localhost` |
| `http://127.0.0.1:8080` | `127.0.0.1` (or use `localhost` instead) |
| `https://swaastrix1.web.app` | `swaastrix1.web.app` |
| `https://swaastrix1.firebaseapp.com` | `swaastrix1.firebaseapp.com` |

**Important:** 
- Don't include port numbers (`:8080`)
- `localhost` covers all ports
- Domain names are case-sensitive

---

## Direct Link to Settings

**Click here:** https://console.firebase.google.com/project/swaastrix1/authentication/settings

Then scroll to "Authorized domains" section.

---

## Still Not Working?

1. **Wait 2-3 minutes** after adding domain
2. **Clear browser cache** (Ctrl+Shift+R)
3. **Check console** - the error message now shows which domain to add
4. **Try incognito mode**

The error message in your app will now tell you exactly which domain to add!
