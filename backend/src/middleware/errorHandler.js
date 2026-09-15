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

  console.error(err);
  return res.status(500).json({ error: 'Erro interno do servidor' });
}

module.exports = { ApiError, notFoundHandler, errorHandler };
