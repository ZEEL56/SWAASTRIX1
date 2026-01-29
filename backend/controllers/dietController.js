const { createDietChart, addDietItem, getDietWithItems } = require('../models/queries');

function scaleNutrients(food, qty) {
  const factor = Number(qty) / 100; // per 100g baseline
  return {
    calories: Number(food.calories) * factor,
    protein: Number(food.protein) * factor,
    carbs: Number(food.carbs) * factor,
    fat: Number(food.fat) * factor,
  };
}

exports.createChart = async (req, res, next) => {
  try {
    const { patient_id, title, items } = req.body;
    if (!patient_id || !title) return res.status(400).json({ error: 'patient_id and title required' });
    const chart = await createDietChart({ patient_id, title });
    if (Array.isArray(items)) {
      for (const it of items) {
        await addDietItem({ diet_chart_id: chart.id, food_id: it.food_id, quantity_g: it.quantity_g });
      }
    }
    res.json(chart);
  } catch (e) { next(e); }
};

exports.getTotals = async (req, res, next) => {
  try {
    const diet_chart_id = Number(req.params.id);
    const items = await getDietWithItems(diet_chart_id);
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const it of items) {
      const scaled = scaleNutrients(it, it.quantity_g);
      totals.calories += scaled.calories;
      totals.protein += scaled.protein;
      totals.carbs += scaled.carbs;
      totals.fat += scaled.fat;
    }
    res.json({ items, totals });
  } catch (e) { next(e); }
};
exports.generateDiet = async (req, res, next) => {
  try {
    const { prakriti = 'vata' } = req.body || {};
    const plans = {
      vata: [
        { meal: 'Breakfast', item: 'Oatmeal with ghee' },
        { meal: 'Lunch', item: 'Vegetable khichdi' },
        { meal: 'Snack', item: 'Soaked almonds' },
        { meal: 'Dinner', item: 'Warm lentil soup' },
      ],
      pitta: [
        { meal: 'Breakfast', item: 'Coconut water + rice flakes' },
        { meal: 'Lunch', item: 'Quinoa salad (cooling veggies)' },
        { meal: 'Snack', item: 'Cucumber slices' },
        { meal: 'Dinner', item: 'Moong dal soup' },
      ],
      kapha: [
        { meal: 'Breakfast', item: 'Warm ginger tea + millets' },
        { meal: 'Lunch', item: 'Stir-fry veggies + brown rice' },
        { meal: 'Snack', item: 'Roasted chana' },
        { meal: 'Dinner', item: 'Light vegetable soup' },
      ],
    };
    const plan = plans[prakriti] || plans.vata;
    res.json({ prakriti, plan });
  } catch (e) { next(e); }
};

const { pool } = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT dc.*, p.name AS patient_name, u.name AS author_name
       FROM diet_charts dc
       JOIN patients p ON p.id = dc.patient_id
       LEFT JOIN users u ON u.id = dc.created_by_user_id
       ORDER BY dc.created_at DESC`
    );
    res.json(rows);
  } catch (e) { next(e); }
};

exports.add = async (req, res, next) => {
  try {
    const { patient_id, title, notes, created_by_user_id } = req.body;
    if (!patient_id || !title) return res.status(400).json({ error: 'patient_id and title required' });
    const { rows } = await pool.query(
      `INSERT INTO diet_charts (patient_id, title, notes, created_by_user_id) VALUES ($1,$2,$3,$4) RETURNING *`,
      [patient_id, title, notes, created_by_user_id]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { patient_id, title, notes, created_by_user_id } = req.body;
    const { rows } = await pool.query(
      `UPDATE diet_charts SET patient_id=$1, title=$2, notes=$3, created_by_user_id=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [patient_id, title, notes, created_by_user_id, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Diet chart not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rowCount } = await pool.query('DELETE FROM diet_charts WHERE id=$1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Diet chart not found' });
    res.status(204).end();
  } catch (e) { next(e); }
};