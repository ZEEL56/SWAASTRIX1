const router = require('express').Router();

router.get('/health', (req, res) => res.json({ ok: true }));
router.get('/db-test', async (req, res) => {
  const { pool } = require('../config/db');
  try {
    const { rows } = await pool.query('SELECT NOW()');
    res.json({ ok: true, now: rows[0].now });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.use('/patients', require('./patients'));
router.use('/food-items', require('./foods'));      // not ./foodItems
router.use('/recipes', require('./recipes'));
router.use('/diet-charts', require('./diet'));      // not ./dietCharts

module.exports = router;