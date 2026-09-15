const { Router } = require('express');
const { listarMotores, buscarMotorPorId } = require('../controllers/motores.controller');

const router = Router();

router.get('/motores', listarMotores);
router.get('/motores/:id', buscarMotorPorId);

module.exports = router;
