const { Router } = require('express');
const healthRoutes = require('./health.routes');
const fabricantesRoutes = require('./fabricantes.routes');
const motoresRoutes = require('./motores.routes');

const router = Router();

router.use(healthRoutes);
router.use(fabricantesRoutes);
router.use(motoresRoutes);

module.exports = router;
