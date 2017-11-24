const express = require('express');
const router = express.Router();

const index = require('../controllers/index');

/*
 * router 只负责业务逻辑的分发
 */

router.get('/', index.index);

router.get('/reg', index.reg);

router.get('/checkUser', index.checkUser);

router.get('/checkEmail', index.checkEmail);

router.post('/doReg', index.doReg);

router.get('/tipEmail', index.tipEmail);

router.get('/verifyEmail', index.verifyEmail);

router.get('/login', index.login);

router.post('/doLogin', index.doLogin);

router.get('/logout', index.logout)

module.exports = router;
