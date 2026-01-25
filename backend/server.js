require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');
const routes = require('./routes');

const app = express();


// CORS: allow your frontend origin(s)
app.use(cors({
  origin: [
    'http://127.0.0.1:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use('/api', routes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  const code = err.status || 500;
  res.status(code).json({ error: err.message || 'Server error' });
});

const port = process.env.PORT || 5000;
app.listen(port,  () => {
console.log(`Server running on port ${port}`);
});