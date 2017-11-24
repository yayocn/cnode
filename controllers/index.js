// 负责处理index相关的业务
const userModel = require('../models/userModel');
const cryptoStr = require('../config/crypto_config');
const sendMail = require('../config/email_config');

const index = {
  index (req, res) {
    res.render('index');
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