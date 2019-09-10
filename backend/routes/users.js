var express = require('express');
var router = express.Router();

var userController = require('../controller/user');
var registerController = require('../controller/register');

router.post('/register', userController.postUser);
router.post('/login', userController.postLogin);

// router.post('/playerReg', registerController.postRegister);
router.post('/playerReg', registerController.createCustomer);

module.exports = router;
