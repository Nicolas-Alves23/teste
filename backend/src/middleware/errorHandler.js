class ApiError extends Error {
  constructor(statusCode, error, details) {
    super(error);
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Rota não encontrada' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    const body = { error: err.error };
    if (err.details) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  // Código duplicado (UNIQUE KEY uk_motor_codigo) que escapou da validação prévia
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Código já cadastrado' });
  }

  // fabricante_id inexistente pego pela FK, como segunda camada de proteção
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: ['fabricante_id não existe'],
    });
  }

  // JSON malformado no corpo da requisição (express.json())
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: ['corpo da requisição não é um JSON válido'],
    });
  }

  console.error(err);
  return res.status(500).json({ error: 'Erro interno do servidor' });
}

module.exports = { ApiError, notFoundHandler, errorHandler };
