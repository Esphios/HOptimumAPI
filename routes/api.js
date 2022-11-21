const express = require('express');
const router  = express.Router();
const apiController = require('../controllers/api');

// router.get('/api', apiController.getAllObj);
// router.post('/api', apiController.newObj);
// router.delete('/api', apiController.deleteAllObj);

router.get('/api/servicos', apiController.servicos);
router.get('/api/quartos', apiController.getQuartos);
router.get('/api/hospedes', apiController.listHospedes);
router.get('/api/carro', apiController.getCarro);

// router.get('/api/:name', apiController.getOneObj);
// router.post('/api/:name', apiController.newComment);
// router.delete('/api/:name', apiController.deleteOneObj);

router.post('/api/login', apiController.login);
router.post('/api/cadastro', apiController.cadastro);
router.post('/api/statusservico', apiController.statusServico);
router.post('/api/carro', apiController.addCarro);
router.post('/api/servico', apiController.addServico);
router.post('/api/reserva', apiController.addReserva);

router.post('/api/reservacheck', apiController.checkReserva);
router.post('/api/hospedecheck', apiController.checkHospede);

router.post('/api/garagem', apiController.garagem);
router.post('/api/auth', apiController.authenticate);

module.exports = router;