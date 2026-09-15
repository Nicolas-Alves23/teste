const { Router } = require('express');
const healthRoutes = require('./health.routes');
const fabricantesRoutes = require('./fabricantes.routes');

const router = Router();

router.use(healthRoutes);
router.use(fabricantesRoutes);

module.exports = router;
