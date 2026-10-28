const { Router } = require('express');
const controller = require('../controllers/dashboardController');
const { autenticar, autorizar } = require('../middlewares/auth');

const router = Router();

router.get('/', autenticar, autorizar('admin'), controller.resumo);

module.exports = router;
