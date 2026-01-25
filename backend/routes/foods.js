const router = require('express').Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { attachUser } = require('../middleware/roles');
const ctrl = require('../controllers/foodsController');

router.get('/', verifyFirebaseToken, attachUser, ctrl.list);

module.exports = router;