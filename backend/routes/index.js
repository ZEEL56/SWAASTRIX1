const router = require('express').Router();

router.get('/health', (req, res) => res.json({ ok: true }));

router.use('/user', require('./user'));
router.use('/patients', require('./patients'));
router.use('/foods', require('./foods'));
router.use('/diet', require('./diet'));

module.exports = router;