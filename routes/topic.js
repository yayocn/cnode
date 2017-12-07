const express = require('express');
const router = express.Router();
const topic = require('../controllers/topic');
const checkUserLogin = require('../middlewares/checkUserLogin');

router.get('/', topic.index);

router.get('/create', checkUserLogin, topic.create);

router.post('/create', checkUserLogin, topic.doCreate);

// 话题图片上传
router.get('/uploadImg', (req, res) => {
  res.send('ok');
})

// 回复
router.post('/reply/:_id', checkUserLogin, topic.reply);

// 点赞
router.get('/reply/zan', topic.zan)

// 收藏话题的路由
router.get('/collect/:_id', topic.collect);

router.get('/:_id', topic.show);

module.exports = router;