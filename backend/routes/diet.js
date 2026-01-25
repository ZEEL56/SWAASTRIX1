const router = require('express').Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { attachUser, requireRole } = require('../middleware/roles');
const ctrl = require('../controllers/dietController');

router.post('/', verifyFirebaseToken, attachUser, requireRole(['doctor']), ctrl.createChart);
router.get('/:id/totals', verifyFirebaseToken, attachUser, ctrl.getTotals);
router.post('/generate', /* verifyFirebaseToken, attachUser, */ ctrl.generateDiet);
module.exports = router;