const router = require('express').Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { attachUser } = require('../middleware/roles');
const ctrl = require('../controllers/userController');

router.post('/save', verifyFirebaseToken, ctrl.saveAuthenticatedUser);
router.get('/me', verifyFirebaseToken, attachUser, ctrl.me);

module.exports = router;