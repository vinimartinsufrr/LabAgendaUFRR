const { Router } = require('express');
const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const laboratorioRoutes = require('./laboratorioRoutes');
const agendamentoRoutes = require('./agendamentoRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = Router();

// Rota simples para verificar se a API está no ar
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/laboratorios', laboratorioRoutes);
router.use('/agendamentos', agendamentoRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
