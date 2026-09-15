const { Router } = require('express');
const {
  listarMotores,
  buscarMotorPorId,
  criarMotor,
  atualizarMotor,
} = require('../controllers/motores.controller');

const router = Router();

router.get('/motores', listarMotores);
router.get('/motores/:id', buscarMotorPorId);
router.post('/motores', criarMotor);
router.put('/motores/:id', atualizarMotor);

module.exports = router;
