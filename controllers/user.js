const userModel = require('../models/userModel');

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
  }
}

module.exports = user;