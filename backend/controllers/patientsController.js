const { pool } = require('../config/db');
const { addPatient, listPatientsForDoctor, updatePatient } = require('../models/queries');

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