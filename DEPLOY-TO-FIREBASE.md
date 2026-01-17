# Deploy to Firebase Hosting

## ✅ Setup Complete!

I've created the necessary files:
- `firebase.json` - Firebase hosting configuration
- `.firebaserc` - Project configuration (swaastrix1)
- `firebase.js` - Fixed to use compat library with your config

## Step 1: Install Firebase CLI (if not installed)

```powershell
npm install -g firebase-tools
```

## Step 2: Login to Firebase

```powershell
firebase login
```

This will open a browser window for you to sign in with your Google account.

## Step 3: Verify Project

```powershell
firebase projects:list
```

You should see `swaastrix1` in the list.

## Step 4: Deploy to Firebase Hosting

```powershell
firebase deploy --only hosting
```

This will:
1. Build and upload your files
2. Deploy to Firebase Hosting
3. Give you a URL like: `https://swaastrix1.web.app` or `https://swaastrix1.firebaseapp.com`

## Step 5: Add Authorized Domain

After deployment, add your Firebase hosting domain to authorized domains:

1. Firebase Console → Authentication → Settings
2. Authorized domains section
3. Add: `swaastrix1.web.app` and `swaastrix1.firebaseapp.com`
4. Save

## Quick Deploy Command

```powershell
firebase deploy
```

## Troubleshooting

### Error: "Not in a Firebase app directory"
**Fixed!** I've created `firebase.json` and `.firebaserc` files.

### Error: "Project not found"
Make sure you're logged in: `firebase login`
Verify project: `firebase use swaastrix1`

### Error: "Permission denied"
Make sure you're the owner/admin of the Firebase project.

## After Deployment

Your app will be available at:
- `https://swaastrix1.web.app`
- `https://swaastrix1.firebaseapp.com`

**Important:** Don't forget to add these domains to Firebase Console → Authentication → Settings → Authorized domains!
