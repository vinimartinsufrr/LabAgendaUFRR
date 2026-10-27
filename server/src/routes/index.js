const { Router } = require('express');
const laboratorioRoutes = require('./laboratorioRoutes');

const router = Router();

// Rota simples para verificar se a API está no ar
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/laboratorios', laboratorioRoutes);

module.exports = router;
