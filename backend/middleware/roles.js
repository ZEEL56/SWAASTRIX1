const { getUserByFirebaseUID } = require('../models/queries');

async function attachUser(req, res, next) {
  try {
    const user = await getUserByFirebaseUID(req.firebaseUid);
    if (!user) return res.status(403).json({ error: 'User not registered' });
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}

function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

module.exports = { attachUser, requireRole };