const { pool } = require('../config/db');

module.exports = {
  // Users
  upsertUser: async ({ firebase_uid, name, role }) => {
    const q = `
      INSERT INTO users (firebase_uid, name, role)
      VALUES ($1,$2,$3)
      ON CONFLICT (firebase_uid) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role
      RETURNING *;
    `;
    const { rows } = await pool.query(q, [firebase_uid, name, role]);
    return rows[0];
  },
  getUserByFirebaseUID: async (uid) => {
    const { rows } = await pool.query('SELECT * FROM users WHERE firebase_uid=$1', [uid]);
    return rows[0];
  },

  // Patients
  addPatient: async ({ user_id, doctor_id, name, age, condition }) => {
    const { rows } = await pool.query(
      `INSERT INTO patients (user_id, doctor_id, name, age, condition)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [user_id, doctor_id, name, age, condition]
    );
    return rows[0];
  },
  listPatientsForDoctor: async (doctor_id) => {
    const { rows } = await pool.query(
      `SELECT p.*, u.name AS user_name
       FROM patients p
       JOIN users u ON u.id = p.user_id
       WHERE p.doctor_id = $1
       ORDER BY p.created_at DESC`,
      [doctor_id]
    );
    return rows;
  },
  updatePatient: async ({ id, doctor_id, name, age, condition }) => {
    const { rows } = await pool.query(
      `UPDATE patients SET name=$1, age=$2, condition=$3
       WHERE id=$4 AND doctor_id=$5
       RETURNING *`,
      [name, age, condition, id, doctor_id]
    );
    return rows[0];
  },

  // Foods
  listFoods: async () => {
    const { rows } = await pool.query('SELECT * FROM foods ORDER BY name ASC');
    return rows;
  },

  // Diet charts
  createDietChart: async ({ patient_id, title }) => {
    const { rows } = await pool.query(
      `INSERT INTO diet_charts (patient_id, title) VALUES ($1,$2) RETURNING *`,
      [patient_id, title]
    );
    return rows[0];
  },
  addDietItem: async ({ diet_chart_id, food_id, quantity_g }) => {
    const { rows } = await pool.query(
      `INSERT INTO diet_items (diet_chart_id, food_id, quantity_g) VALUES ($1,$2,$3) RETURNING *`,
      [diet_chart_id, food_id, quantity_g]
    );
    return rows[0];
  },
  getDietWithItems: async (diet_chart_id) => {
    const { rows } = await pool.query(
      `SELECT di.id, di.quantity_g, f.*
       FROM diet_items di
       JOIN foods f ON f.id = di.food_id
       WHERE di.diet_chart_id = $1`,
      [diet_chart_id]
    );
    return rows;
  }
};