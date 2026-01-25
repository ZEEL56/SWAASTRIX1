const router = require('express').Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { attachUser, requireRole } = require('../middleware/roles');
const ctrl = require('../controllers/patientsController');

router.post('/', verifyFirebaseToken, attachUser, requireRole(['doctor']), ctrl.addPatient);
router.get('/', verifyFirebaseToken, attachUser, requireRole(['doctor']), ctrl.listPatients);
router.put('/:id', verifyFirebaseToken, attachUser, requireRole(['doctor']), ctrl.updatePatient);
router.get('/:id/history', /* verifyFirebaseToken, attachUser, requireRole(['doctor']), */ ctrl.history);
module.exports = router;