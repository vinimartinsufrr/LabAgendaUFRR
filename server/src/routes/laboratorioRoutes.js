const { Router } = require('express');
const controller = require('../controllers/laboratorioController');
const { autenticar, autorizar } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const schemas = require('../validators/laboratorioValidator');

const router = Router();

// Qualquer usuário logado pode consultar os laboratórios
router.use(autenticar);

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);

// Apenas administradores cadastram, alteram e removem
router.post('/', autorizar('admin'), validate(schemas.criar), controller.criar);
router.put('/:id', autorizar('admin'), validate(schemas.atualizar), controller.atualizar);
router.delete('/:id', autorizar('admin'), controller.remover);

module.exports = router;
