const express = require('express');
const router = express.Router();
const topic = require('../controllers/topic');
const checkUserLogin = require('../middlewares/checkUserLogin');

router.get('/', topic.index);
router.get('/create', checkUserLogin, topic.create);
router.post('/create', checkUserLogin, topic.doCreate);
router.get('/:_id', checkUserLogin, topic.show);

module.exports = router;