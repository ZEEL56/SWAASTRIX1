const { pool } = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM food_items ORDER BY name ASC');
    res.json(rows);
  } catch (e) { next(e); }
};



exports.add = async (req, res, next) => {
  try {
    const { name, calories, protein, carbs, fat, ayurvedic_properties } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const { rows } = await pool.query(
      `INSERT INTO food_items (name, calories, protein, carbs, fat, ayurvedic_properties)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, calories, protein, carbs, fat, ayurvedic_properties]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, calories, protein, carbs, fat, ayurvedic_properties } = req.body;
    const { rows } = await pool.query(
      `UPDATE food_items SET name=$1, calories=$2, protein=$3, carbs=$4, fat=$5, ayurvedic_properties=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [name, calories, protein, carbs, fat, ayurvedic_properties, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Food item not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rowCount } = await pool.query('DELETE FROM food_items WHERE id=$1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Food item not found' });
    res.status(204).end();
  } catch (e) { next(e); }
};