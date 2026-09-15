const { pool } = require('../config/db');
const { validateMotorInput } = require('../validators/motor.validator');
const { ApiError } = require('../middleware/errorHandler');

const SELECT_BASE = `
  SELECT
    m.id, m.codigo, m.modelo, m.fabricante_id, f.nome AS fabricante_nome,
    m.potencia_cv, m.tensao, m.frequencia_hz, m.polos, m.rotacao_rpm,
    m.carcaca, m.grau_protecao, m.preco, m.criado_em
  FROM motores m
  JOIN fabricantes f ON f.id = m.fabricante_id
`;

async function listarMotores(req, res, next) {
  try {
    const { search } = req.query;

    if (search && String(search).trim() !== '') {
      const termo = `%${String(search).trim()}%`;
      const [rows] = await pool.query(
        `${SELECT_BASE} WHERE m.codigo LIKE ? OR m.modelo LIKE ? ORDER BY m.id`,
        [termo, termo]
      );
      return res.status(200).json(rows);
    }

    const [rows] = await pool.query(`${SELECT_BASE} ORDER BY m.id`);
    return res.status(200).json(rows);
  } catch (err) {
    return next(err);
  }
}

async function buscarMotorPorId(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`${SELECT_BASE} WHERE m.id = ?`, [id]);

    if (rows.length === 0) {
      throw new ApiError(404, 'Motor não encontrado');
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    return next(err);
  }
}

async function fabricanteExiste(fabricanteId) {
  const [rows] = await pool.query('SELECT id FROM fabricantes WHERE id = ?', [fabricanteId]);
  return rows.length > 0;
}

async function criarMotor(req, res, next) {
  try {
    const { details, values } = validateMotorInput(req.body);

    if (values.fabricante_id !== null && !(await fabricanteExiste(values.fabricante_id))) {
      details.push('fabricante_id não existe');
    }

    if (details.length > 0) {
      throw new ApiError(400, 'Dados inválidos', details);
    }

    const [result] = await pool.query(
      `INSERT INTO motores
        (codigo, modelo, fabricante_id, potencia_cv, tensao, frequencia_hz, polos, rotacao_rpm, carcaca, grau_protecao, preco)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        values.codigo,
        values.modelo,
        values.fabricante_id,
        values.potencia_cv,
        values.tensao,
        values.frequencia_hz,
        values.polos,
        values.rotacao_rpm,
        values.carcaca,
        values.grau_protecao,
        values.preco,
      ]
    );

    const [rows] = await pool.query(`${SELECT_BASE} WHERE m.id = ?`, [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return next(new ApiError(409, 'Código já cadastrado'));
    }
    return next(err);
  }
}

module.exports = {
  SELECT_BASE,
  listarMotores,
  buscarMotorPorId,
  criarMotor,
};
