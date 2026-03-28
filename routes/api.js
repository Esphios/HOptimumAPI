const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api');
const { secure } = require('../scripts/utilsDB.js');
const { requireAuth, requireEspAuth } = require('../scripts/security');

// router.get('/api', (...params) => secure(...params, apiController.getAllObj));
// router.post('/api', (...params) => secure(...params, apiController.newObj));
// router.delete('/api', (...params) => secure(...params, apiController.deleteAllObj));

router.get('/api/servicos', (...params) => secure(...params, apiController.servicos));
router.get('/api/quartos', (...params) => secure(...params, apiController.getQuartos));
router.get('/api/hospedes', requireAuth({ allowTypes: ['funcionario'], allowRoles: ['seguranÃ§a'] }), (...params) => secure(...params, apiController.listHospedes));
router.get('/api/carro', requireAuth({ allowTypes: ['funcionario'], allowRoles: ['seguranÃ§a'] }), (...params) => secure(...params, apiController.getCarro));

// router.get('/api/:name', (...params) => secure(...params, apiController.getOneObj));
// router.post('/api/:name', (...params) => secure(...params, apiController.newComment));
// router.delete('/api/:name', (...params) => secure(...params, apiController.deleteOneObj));

router.post('/api/login', (...params) => secure(...params, apiController.login));
router.post('/api/cadastro', requireAuth({ allowTypes: ['funcionario'], allowRoles: ['seguranÃ§a'] }), (...params) => secure(...params, apiController.cadastro));
router.post('/api/statusservico', requireAuth({ allowTypes: ['funcionario'], allowRoles: ['seguranÃ§a', 'limpeza', 'cozinha'] }), (...params) => secure(...params, apiController.statusServico));
router.post('/api/carro', requireAuth({ allowTypes: ['funcionario'], allowRoles: ['seguranÃ§a'] }), (...params) => secure(...params, apiController.addCarro));
router.post('/api/servico', requireAuth({ allowTypes: ['hospede', 'funcionario'], allowRoles: ['seguranÃ§a'] }), (...params) => secure(...params, apiController.addServico));
router.post('/api/reserva', requireAuth({ allowTypes: ['funcionario'], allowRoles: ['seguranÃ§a'] }), (...params) => secure(...params, apiController.addReserva));
router.post('/api/updatereserva', requireAuth({ allowTypes: ['funcionario'], allowRoles: ['seguranÃ§a'] }), (...params) => secure(...params, apiController.updateReserva));

router.post('/api/reservacheck', requireAuth({ allowTypes: ['hospede', 'funcionario'], allowRoles: ['seguranÃ§a'] }), (...params) => secure(...params, apiController.checkReserva));
router.post('/api/hospedecheck', requireAuth({ allowTypes: ['funcionario'], allowRoles: ['seguranÃ§a'] }), (...params) => secure(...params, apiController.checkHospede));

router.post('/api/garagem', requireAuth({ allowTypes: ['funcionario'], allowRoles: ['seguranÃ§a'] }), (...params) => secure(...params, apiController.garagem));
router.post('/api/auth', requireEspAuth, (...params) => secure(...params, apiController.authenticate));
router.post('/api/report', requireAuth({ allowTypes: ['hospede'] }), (...params) => secure(...params, apiController.report));

module.exports = router;
