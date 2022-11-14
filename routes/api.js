const express = require('express');
const router  = express.Router();
const apiController = require('../controllers/api');

router.get('/api', apiController.getAllObj);
router.post('/api', apiController.newObj);
router.delete('/api', apiController.deleteAllObj);

// router.get('/api/:name', apiController.getOneObj);
// router.post('/api/:name', apiController.newComment);
// router.delete('/api/:name', apiController.deleteOneObj);

router.post('/api/auth', apiController.authenticate);
router.post('/api/login', apiController.login);
router.post('/api/cadastro', apiController.cadastro);
router.post('/api/garagem', apiController.garagem);
router.post('/api/statusservico', apiController.statusServico);

module.exports = router;