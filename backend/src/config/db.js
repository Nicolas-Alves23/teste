const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'motores_user',
  password: process.env.DB_PASSWORD || 'motores_pass',
  database: process.env.DB_NAME || 'motores_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  decimalNumbers: true,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// O compose já usa healthcheck + depends_on(service_healthy), mas mantemos
// essa retentativa aqui como segunda camada de proteção (ex.: subida manual
// sem compose, ou MySQL demorando mais que o esperado para aceitar conexões).
async function waitForDatabase({ retries = 20, delayMs = 3000 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const connection = await pool.getConnection();
      connection.release();
      console.log('Conectado ao MySQL com sucesso.');
      return;
    } catch (err) {
      console.log(
        `Aguardando MySQL ficar disponível... tentativa ${attempt}/${retries} (${err.code || err.message})`
      );
      await sleep(delayMs);
    }
  }
  throw new Error('Não foi possível conectar ao MySQL após várias tentativas.');
}

module.exports = { pool, waitForDatabase };
