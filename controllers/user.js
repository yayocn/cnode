const userModel = require('../models/userModel');
const topicModel = require('../models/topicModel');
const replyModel = require('../models/replyModel');
const cryptoStr = require('../config/crypto_config');
const uploadFile = require('../config/uploadFile_config');
const gm = require('gm');
const ep = require('eventproxy')();

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
  // 用户主页
  showInfo (req, res) {
    const con = {
      username: req.params.username
    }

    ep.all('lastCreateTopic', 'lastReplyTopic', 'userData', (lastCreateTopic, lastReplyTopic, userData ) => {
      res.render('showUserInfo', { lastCreateTopic, lastReplyTopic, userData });
    });

    userModel.findOne(con, { userpic: 1, username: 1, score: 1, collect: 1, regTime: 1 }, (err, userData) => {
      if (userData) {
        ep.emit('userData', userData);
        // 最近发布的话题
        topicModel.find({ user: userData._id }, { reply: 1, viewNum: 1, title: 1, top: 1, good: 1, createTime: 1 }, {
          sort: { createTime: -1 },
          limit: 5
        }, (err, topicData) => {
          if (topicData) {
            ep.emit('lastCreateTopic', topicData);
          } else {
            ep.emit('lastCreateTopic', []);
          }
        })

        // 最近参与的话题
        replyModel.find({ user: userData._id }, { topic: 1 }, {
          sort: { replyTime: -1 },
          limit: 5
        }, (err, topicIds) => {
          if (topicIds) {
            if (topicIds) {
              // 参与了回复

              let ids = [];
              topicIds.forEach((item) => {
                ids.push(item.topic);
              })
              // 查询topic
              const con = {
                _id: { $in: ids}
              };

              topicModel.find(con)
                .populate('user', { userpic: 1 })
                .exec((err, huati) => {
                  ep.emit('lastReplyTopic', huati);
                })
            } else {
              // 没有参与回复
              ep.emit('lastReplyTopic', []);
            }
          }
        })
      } else {
        res.render('tip', { errMsg: '用户不存在！'});
      }
    })
  }
}

module.exports = user;