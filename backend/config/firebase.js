const admin = require('firebase-admin');

function initFirebase() {
  if (admin.apps.length) return admin;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not set');
  const serviceAccount = JSON.parse(json);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  return admin;
}

module.exports = { initFirebase };