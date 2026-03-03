require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');
const routes = require('./routes');
const airoutes = require('./routes/airoutes');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use('/api/ai', airoutes);   // AFTER express.json
app.use('/api', routes);

// Root info route
app.get('/', (req, res) => {
  res.type('text/plain').send('SWAASTRIX API is running. Try GET /api/health or POST /api/ai');
});
app.use((err, req, res, next) => {
  console.error(err);
  const code = err.status || 500;
  res.status(code).json({ error: err.message || 'Server error' });
});
 
// Start server
const port = process.env.PORT || 5000;
app.listen(port, async () => {
  try { await pool.query('SELECT 1'); console.log('DB connected'); }
  catch (e) { console.error('DB connection failed', e.message); }
  console.log(`Server running on port ${port}`);
});