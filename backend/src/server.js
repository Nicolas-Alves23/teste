require('dotenv').config();

const { createApp } = require('./app');
const { waitForDatabase } = require('./config/db');

const PORT = process.env.PORT || process.env.BACKEND_PORT || 3000;

async function start() {
  await waitForDatabase();

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`API de motores rodando na porta ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Falha ao iniciar a aplicação:', err);
  process.exit(1);
});
