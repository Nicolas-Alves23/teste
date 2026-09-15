const { Router } = require('express');
const {
  listarMotores,
  buscarMotorPorId,
  criarMotor,
} = require('../controllers/motores.controller');

const router = Router();

router.get('/motores', listarMotores);
router.get('/motores/:id', buscarMotorPorId);
router.post('/motores', criarMotor);

module.exports = router;
