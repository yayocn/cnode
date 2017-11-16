// 负责处理index相关的业务
const userModel = require('../models/userModel');

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

  }
};

module.exports = index;