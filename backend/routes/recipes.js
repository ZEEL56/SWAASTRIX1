const router = require('express').Router();
const ctrl = require('../controllers/recipesController');

router.get('/', ctrl.list);
router.post('/', ctrl.add);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;