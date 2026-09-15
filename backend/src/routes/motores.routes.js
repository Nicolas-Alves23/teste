const { Router } = require('express');
const { listarMotores } = require('../controllers/motores.controller');

const router = Router();

router.get('/motores', listarMotores);

module.exports = router;
