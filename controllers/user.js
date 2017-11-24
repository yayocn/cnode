const userModel = require('../models/userModel');
const cryptoStr = require('../config/crypto_config');

const user = {
  index (req, res, next) {

  },
  // 进入用户设置中心
  userInfo (req, res) {
    res.render('userCenter')
  },
  // 更新用户个人信息
  setInfo (req, res) {
    const con = {
      _id: req.session.user._id
    };

    const data = {
      mark: req.body.mark
    }

    userModel.update(con, data, (err, msg) => {
      if (!err) {
        // 更新cookie
        userModel.findOne(con, (err, data) => {
          req.session.user = data;
          res.redirect('back');
        })
      }
    })
  },
  // 设置新密码
  setPwd (req, res) {
    const con = {
      _id: req.session.user._id,
      userpwd: cryptoStr(req.body.userpwd.trim())
    };

    userModel.findOne(con, (err, data) => {
      if (data) {
        const newData = {
          userpwd: cryptoStr(req.body.newuserpwd.trim())
        };

        userModel.update(con, newData, (err) => {
          if (err) {
            // 说明有错误
          } else {
            // 提示用户密码更新成功
            req.flash('setPwdOk','密码已经被修改！');
            res.redirect('back');
          }
        });
      } else {
        req.flash('pwdErrorMsg', '原密码错误!');
        res.redirect('back');
      }
    })
  }
}

module.exports = user;