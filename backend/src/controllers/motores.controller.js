const { pool } = require('../config/db');

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

module.exports = {
  SELECT_BASE,
  listarMotores,
};
