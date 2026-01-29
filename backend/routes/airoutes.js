// backend/routes/airoutes.js
const router = require('express').Router();

router.post('/', (req, res) => {
  const message = String(req.body?.message || '').toLowerCase().trim();
  if (!message) return res.status(400).json({ error: 'message required' });

  let reply = 'I can suggest diets or recipes. Try: "pitta diet", "kapha diet", or "show recipes".';

  if (message.includes('pitta')) {
    reply = 'Pitta diet: cooling foods (cucumber, coconut, mint). Avoid very spicy, sour, fried foods.';
  } else if (message.includes('vata')) {
    reply = 'Vata diet: warm, cooked foods (khichdi, soups), healthy fats like ghee. Avoid cold/raw foods.';
  } else if (message.includes('kapha')) {
    reply = 'Kapha diet: light, warm, drying foods (millets, pulses). Use ginger/pepper; avoid heavy/oily/sugary.';
  } else if (message.includes('recipe') || message.includes('recipes')) {
    reply = 'Recipes: Moong Dal Khichdi, Vegetable Stew, Ginger Tea. Ask for a prakriti-specific plan.';
  } else if (message.includes('acidity')) {
    reply = 'For acidity: favor cooling foods (coconut water, cucumber). Avoid chili, fried, and sour foods.';
  }

  res.json({ reply });
});

module.exports = router;