var express = require('express');
var router = express.Router();
const user = require('../controllers/user');
const checkUserLogin = require('../middlewares/checkUserLogin');

/* GET users listing. */
router.get('/', user.index);

router.get('/userInfo', checkUserLogin, user.userInfo);

router.post('/setInfo', checkUserLogin, user.setInfo);

router.post('/setPwd', checkUserLogin, user.setPwd);

router.post('/setUserpic', checkUserLogin, user.setUserpic);

module.exports = router;
