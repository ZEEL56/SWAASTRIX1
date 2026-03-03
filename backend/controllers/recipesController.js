const { pool } = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, u.name AS author_name
       FROM recipes r
       LEFT JOIN users u ON u.id = r.created_by_user_id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (e) { next(e); }
};

exports.add = async (req, res, next) => {
  try {
    const { name, description, created_by_user_id } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const { rows } = await pool.query(
      `INSERT INTO recipes (name, description, created_by_user_id) VALUES ($1,$2,$3) RETURNING *`,
      [name, description, created_by_user_id]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, description, created_by_user_id } = req.body;
    const { rows } = await pool.query(
      `UPDATE recipes SET name=$1, description=$2, created_by_user_id=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [name, description, created_by_user_id, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Recipe not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rowCount } = await pool.query('DELETE FROM recipes WHERE id=$1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Recipe not found' });
    res.status(204).end();
  } catch (e) { next(e); }
};