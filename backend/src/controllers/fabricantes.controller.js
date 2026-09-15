const { pool } = require('../config/db');

async function listarFabricantes(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id, nome FROM fabricantes ORDER BY nome');
    return res.status(200).json(rows);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listarFabricantes };
