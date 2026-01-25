const { upsertUser, getUserByFirebaseUID } = require('../models/queries');

exports.saveAuthenticatedUser = async (req, res, next) => {
  try {
    const { name, role } = req.body;
    if (!name || !role) return res.status(400).json({ error: 'name and role required' });
    const user = await upsertUser({ firebase_uid: req.firebaseUid, name, role });
    res.json(user);
  } catch (e) { next(e); }
};

exports.me = async (req, res) => {
  const user = await getUserByFirebaseUID(req.firebaseUid);
  res.json(user || null);
};