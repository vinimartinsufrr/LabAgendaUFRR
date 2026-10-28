const { Router } = require('express');
const controller = require('../controllers/authController');
const { autenticar } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const schemas = require('../validators/authValidator');

const router = Router();

router.post('/registro', validate(schemas.registro), controller.registro);
router.post('/login', validate(schemas.login), controller.login);
router.get('/me', autenticar, controller.me);

module.exports = router;
