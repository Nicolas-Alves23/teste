const { pool } = require('../config/db');

async function getHealth(req, res) {
  try {
    await pool.query('SELECT 1');
    return res.status(200).json({ status: 'ok', database: 'ok' });
  } catch (err) {
    return res.status(503).json({ status: 'error', database: 'error' });
  }
}

module.exports = { getHealth };
