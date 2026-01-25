const { listFoods } = require('../models/queries');

exports.list = async (req, res, next) => {
  try {
    const foods = await listFoods();
    res.json(foods);
  } catch (e) { next(e); }
};