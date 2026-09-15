const { Router } = require('express');
const {
  listarMotores,
  buscarMotorPorId,
  criarMotor,
  atualizarMotor,
  excluirMotor,
} = require('../controllers/motores.controller');

const router = Router();

router.get('/motores', listarMotores);
router.get('/motores/:id', buscarMotorPorId);
router.post('/motores', criarMotor);
router.put('/motores/:id', atualizarMotor);
router.delete('/motores/:id', excluirMotor);

module.exports = router;
