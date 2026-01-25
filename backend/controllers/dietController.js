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