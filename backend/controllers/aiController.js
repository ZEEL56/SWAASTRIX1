const { pool } = require('../config/db');
const router = require('express').Router();
const { ask } = require('../controllers/aiController');

router.post('/', ask);

module.exports = router;
function detectPrakriti(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('pitta')) return 'pitta';
  if (t.includes('kapha')) return 'kapha';
  return 'vata';
}

exports.ask = async (req, res, next) => {
  try {
    const question = String(req.body?.question || '').trim();
    if (!question) return res.status(400).json({ error: 'question required' });

    const q = question.toLowerCase();
    const wantsRecipes = q.includes('recipe') || q.includes('cook') || q.includes('dish');
    const wantsDiet = q.includes('diet') || q.includes('meal') || q.includes('eat') || q.includes('suggest');

    // Simple prakriti routing if present
    const prakriti = detectPrakriti(q);

    let suggestions = [];
    let recipes = [];
    let answer = '';

    if (wantsDiet) {
      if (prakriti === 'vata') {
        suggestions = [
          'Warm, cooked foods (khichdi, soups)',
          'Healthy fats like ghee and sesame oil',
          'Avoid cold, raw foods and excessive beans'
        ];
      } else if (prakriti === 'pitta') {
        suggestions = [
          'Cooling foods (cucumber, coconut, mint)',
          'Favor sweet/bitter/astringent tastes',
          'Avoid very spicy, sour, fried foods'
        ];
      } else {
        // kapha
        suggestions = [
          'Light, warm, and drying foods (millets, pulses)',
          'Ginger/black pepper for metabolism',
          'Avoid heavy, oily, sugary foods'
        ];
      }
      answer = `Here are ${prakriti} balancing dietary suggestions.`;
    }

    if (wantsRecipes) {
      // Try to fetch a few recipes from DB (fallback to static if table missing)
      try {
        const { rows } = await pool.query(
          'SELECT id, title, description FROM recipes ORDER BY created_at DESC LIMIT 5'
        );
        recipes = rows;
      } catch {
        recipes = [
          { id: 1, title: 'Moong Dal Khichdi', description: 'Light, easy to digest' },
          { id: 2, title: 'Vegetable Stew', description: 'Warm and nourishing' }
        ];
      }
      if (!answer) answer = 'Here are some recipes you can consider.';
    }

    if (!wantsDiet && !wantsRecipes) {
      answer = 'I can suggest diet ideas or recipes. Try asking: "Suggest a pitta diet" or "Show some healthy recipes".';
    }

    res.json({ reply: answer, prakriti, suggestions, recipes });
  } catch (e) { next(e); }
};