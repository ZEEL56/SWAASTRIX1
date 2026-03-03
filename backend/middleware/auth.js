const { initFirebase } = require('../config/firebase');

let admin; // lazy init to avoid crashing on server start
function getAdmin() {
  if (!admin) admin = initFirebase();
  return admin;
}

async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing Bearer token' });

    const decoded = await getAdmin().auth().verifyIdToken(token);
    req.firebaseUid = decoded.uid;
    next();
  } catch (err) {
    // If Firebase isn’t configured, avoid crashing the server
    if (err && /FIREBASE_SERVICE_ACCOUNT_JSON/.test(err.message)) {
      return res.status(500).json({ error: 'Auth not configured on server' });
    }
    return res.status(401).json({ error: 'Invalid token', details: err.message });
  }
}

module.exports = { verifyFirebaseToken };