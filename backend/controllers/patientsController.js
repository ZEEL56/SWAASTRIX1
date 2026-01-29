const { pool } = require('../config/db');



exports.addPatient = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ error: 'Only doctors can add patients' });
    const { patient_user_id, name, age, condition } = req.body;
    if (!patient_user_id || !name) return res.status(400).json({ error: 'patient_user_id and name required' });
    const patient = await addPatient({
      user_id: patient_user_id,
      doctor_id: req.user.id,
      name, age, condition
    });
    res.json(patient);
  } catch (e) { next(e); }
};

exports.listPatients = async (req, res, next) => {
  try {
    const patients = await listPatientsForDoctor(req.user.id);
    res.json(patients);
  } catch (e) { next(e); }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, age, condition } = req.body;
    const updated = await updatePatient({ id, doctor_id: req.user.id, name, age, condition });
    if (!updated) return res.status(404).json({ error: 'Patient not found' });
    res.json(updated);
  } catch (e) { next(e); }
};
exports.history = async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const timeline = [
      { date: '2026-01-10', note: 'Initial consultation. Prescribed Vata diet.' },
      { date: '2026-01-17', note: 'Reported improvement in digestion.' },
      { date: '2026-01-24', note: 'Adjusted diet to reduce acidity.' },
    ];
    res.json({ patientId: id, timeline });
  } catch (e) { next(e); }
};



exports.list = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.name AS user_name, d.name AS doctor_name
       FROM patients p
       JOIN users u ON u.id = p.user_id
       JOIN users d ON d.id = p.doctor_id
       ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (e) { next(e); }
};

exports.add = async (req, res, next) => {
  try {
    const { user_id, doctor_id, name, age, condition } = req.body;
    if (!user_id || !doctor_id || !name) return res.status(400).json({ error: 'user_id, doctor_id, name required' });
    const { rows } = await pool.query(
      `INSERT INTO patients (user_id, doctor_id, name, age, condition)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [user_id, doctor_id, name, age, condition]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, age, condition } = req.body;
    const { rows } = await pool.query(
      `UPDATE patients SET name=$1, age=$2, condition=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [name, age, condition, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Patient not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rowCount } = await pool.query('DELETE FROM patients WHERE id=$1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Patient not found' });
    res.status(204).end();
  } catch (e) { next(e); }
};