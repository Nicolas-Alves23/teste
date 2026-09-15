const { Router } = require('express');
const { listarFabricantes } = require('../controllers/fabricantes.controller');

const router = Router();

router.get('/fabricantes', listarFabricantes);

module.exports = router;
