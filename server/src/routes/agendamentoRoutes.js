const { Router } = require('express');
const controller = require('../controllers/agendamentoController');
const { autenticar, autorizar } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const schemas = require('../validators/agendamentoValidator');

const router = Router();

router.use(autenticar);

router.get('/', validate(schemas.filtros, 'query'), controller.listar);
// Precisa vir antes de "/:id" para "disponibilidade" não ser tratado como id
router.get('/disponibilidade', validate(schemas.disponibilidade, 'query'), controller.disponibilidade);
router.get('/:id', controller.buscarPorId);
router.post('/', validate(schemas.criar), controller.criar);
router.put('/:id', validate(schemas.atualizar), controller.atualizar);
router.patch('/:id/cancelar', controller.cancelar);
router.delete('/:id', autorizar('admin'), controller.remover);

module.exports = router;
