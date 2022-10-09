const express = require('express');
const router  = express.Router(); 
const apiController = require('../controllers/api'); 

router.get('/api', apiController.getAllObj);
router.post('/api', apiController.newObj);
router.delete('/api', apiController.deleteAllObj);

router.get('/api/:name', apiController.getOneObj);
router.post('/api/:name', apiController.newComment);
router.delete('/api/:name', apiController.deleteOneObj);

module.exports = router;