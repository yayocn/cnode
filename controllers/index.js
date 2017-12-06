// 负责处理index相关的业务
const userModel = require('../models/userModel');
const cryptoStr = require('../config/crypto_config');
const sendMail = require('../config/email_config');
const ep = new require('eventproxy')();
const cateModel = require('../models/cateModel');
const topicModel = require('../models/topicModel');

const index = {
  index (req, res) {
    /**
     * 1. 分配话题类型数据
     * 2. 分配话题列表数据（分页）
     * 3. 无人回复话题
     * 4. 积分榜前10
     * 5. 友情社区（必须是管理员在后台添加）
     */

    // 监控
    ep.all('cateData', 'topic', 'zeroReplyData', 'scoreboard', (cateData, topic, zeroReplyData, scoreboard) => {
      res.render('index', { cateData, topicData: topic.topicData, tab: topic.tab, page: topic.page, pageMax: topic.pageMax, zeroReplyData, scoreboard });
    });

    // 话题类型
    cateModel.find({}, {}, {
      sort: { ordernum: 1 }
    }, (err, data) => {
      ep.emit('cateData', data);
    });

    const con = {};
    if(req.query.tab==undefined || req.query.tab=='all'){
      // 现在请求所有的数据
      req.query.tab = 'all';
    }else if(req.query.tab=='good'){
      // 查询good为真的
      con.good = true;
    }else{
      // 分类是相同的
      con.cate = req.query.tab
    }

    let pageSize = 5;
    let page = req.query.page ? req.query.page : 1;

    // 符合条件的结果总数
    topicModel.find(con, {}).populate('user', { userpic: 1 }).populate('cate', { catename: 1 }).count((err, totalNum) => {
      if (totalNum <= 0) {
        ep.emit('topic', { topicData: [], tab: req.query.tab, page: 0, pageMax: 0 });
        return ;
      }

      if (page <= 0) {
        page = 1;
      }

      const pageMax = Math.ceil(totalNum / pageSize);
      if (page > pageMax) {
        page = pageMax;
      }

      const pageOffset = pageSize * (page - 1);

      // 话题列表  -- 用到分页
      topicModel.find(con, {}, {
        sort: {
          // 先显示置顶
          top: -1,
          createTime: -1,
        },
        skip: pageOffset,
        limit: pageSize
      })
        .populate('user', { userpic: 1, username: 1 })
        .populate('cate', { catename: 1 })
        .exec((err, data) => {
          ep.emit('topic', { topicData: data, tab: req.query.tab, page: page, pageMax: pageMax });
        })

    })

    // 查询0回复的话题
    topicModel.find({ reply: { $size: 0 }}, { title: 1 }, {
      sort: { createTime: -1 },
      limit: 5
    }, (err, data) => {
      ep.emit('zeroReplyData', data);
    });

    // 查询积分榜
    userModel.find({}, { username: 1, score: 1 }, {
      sort: { score: -1 },
      limit: 10
    }, (err, data) => {
      ep.emit('scoreboard', data);
    })
  },
  reg (req, res) {
    res.render('reg')
  },
  checkUser (req, res) {
    const condition = {
      username: req.query.username
    };

    userModel.findOne(condition, (err, data) => {
      if (data) {
        res.send('used');
      } else {
        res.send('ok')
      }
    })
  },
  checkEmail (req, res) {
    const condition = {
      email: req.query.email
    };

    userModel.findOne(condition, (err, data) => {
      if (data) {
        res.send('used');
      } else {
        res.send('ok')
      }
    })
  },
  doReg (req, res) {
    /*
       先验证数据安全性， CSRF 验证， 判断来源可信等
     */

    const data = {
      username: req.body.username,
      // 密码是明文，需要加密
      userpwd: cryptoStr(req.body.userpwd),
      email: req.body.email,
    };

    userModel.create(data, (err, msg) => {
      // 邮箱验证,激活账户
      if (msg) {
        sendMail(msg.username, msg._id, msg.email, err => {
          if (err) {
            // 邮件发送失败，进入个人中心重新激活。
          } else {
            // 跳转提示用户邮件发送成功的页面
            res.redirect('/tipEmail')
          }
        });
      }
    })
  },
  tipEmail (req, res) {
    res.render('tipEmail');
  },
  verifyEmail (req, res) {
    const con = {
      _id: req.query._id
    };

    userModel.update(con, { active: 1 }, (err, msg) => {
      if (err) {

      } else {
        // 激活成功，自动登录
        userModel.findOne(con, (err, userData) => {
          req.session.user = userData;

          res.redirect('/');
        })
      }
    })
  },
  login (req, res) {
    res.render('login');
  },
  doLogin (req, res) {
    const con = {
      username: req.body.username,
      userpwd: cryptoStr(req.body.userpwd.trim())
    }

    userModel.findOne(con, (err, data) => {
      if (data) {
        // 没有问题
        req.session.user = data;
        res.redirect('/');
      } else {

        req.flash('errMsg', '账户或者密码错误！');
        res.redirect('back')
      }
    })
  },
  logout (req, res) {
    // 销毁session
    delete req.session.user;
    res.redirect('/');
  }
};

module.exports = index;