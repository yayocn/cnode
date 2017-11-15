const express = require('express');
const router = express.Router();

const index = require('../controllers/index');

/*
 * router 只负责业务逻辑的分发
 */

router.get('/', index.index);

module.exports = router;
