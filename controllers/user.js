const userModel = require('../models/userModel');
const cryptoStr = require('../config/crypto_config');
const uploadFile = require('../config/uploadFile_config');
const gm = require('gm');

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
            req.flash('setPwdOk', '密码已经被修改！');
            res.redirect('back');
          }
        });
      } else {
        req.flash('pwdErrorMsg', '原密码错误!');
        res.redirect('back');
      }
    })
  },
  // 设置新头像
  setUserpic (req, res) {
    // 需要处理上传的文件
    const savePath = './uploads';
    const allowType = ['image/png', 'image/gif', 'image/jpeg'];
    const fileMaxSize = 1024 * 1024 * 5;
    const upload = uploadFile(savePath, allowType, fileMaxSize).single('userpic');

    // 上传
    upload(req, res,  err => {
      // 判断错误信息，根据错误信息返回指定的标记
      if (err) {
        // 返回错误信息
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            req.flash('errMsg', '太大了，杨思涵受不了!');
            break;
          case 'fileFilter':
            req.flash('errMsg', '八字不合!');
            break;
        }

        // 返回文件上传页面
        res.redirect('back');

        // 终止程序
        return;
      }

      // 表示文件上传成功

      // 响应文件上传成功了

      // 将图片进行缩放gm
      gm(req.file.path).resize(120, 120).write(req.file.path, function (err) {
        // 条件
        var con = {
          _id: req.session.user._id
        }

        // 将上传成功后的头像数据，更新到数据库中
        var newData = {
          userpic: req.file.filename
        };

        userModel.update(con, newData, function (err) {
          if (!err) {
            // 更新当前的缓存
            req.session.user.userpic = req.file.filename;

            // 跳转
            res.redirect('back');
          }
        })
      });
    });
  },
}

module.exports = user;