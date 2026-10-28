const { Router } = require('express');
const controller = require('../controllers/usuarioController');
const { autenticar, autorizar } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const schemas = require('../validators/usuarioValidator');

const router = Router();

router.use(autenticar);

router.get('/', autorizar('admin'), controller.listar);
router.post('/', autorizar('admin'), validate(schemas.criar), controller.criar);
// Ver e editar: o controller libera o admin ou o próprio usuário
router.get('/:id', controller.buscarPorId);
router.put('/:id', validate(schemas.atualizar), controller.atualizar);
router.delete('/:id', autorizar('admin'), controller.remover);

module.exports = router;
