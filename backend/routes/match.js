var express = require('express');
var router = express.Router();

var matchController = require('../controller/match');

router.post('/match', matchController.postData);
router.get('/match', matchController.getData);


module.exports = router;
