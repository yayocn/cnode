const mongoose = require('../config/db_config');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  userpwd: {
    type: String
  },
  userpic: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    unique: true
  },
  active: {
    type: Number,
    // 0 表示未激活，不能使用
    default: 0
  },
  regTime: {
    type: Date,
    default: Date.now
  },
  lastLoginTime: {
    type: Date,
    default: Date.now
  },
  mark: {
    type: String,
    default: ''
  },
  // 积分
  score: {
    type: Number,
    default: 0
  }
});

const userModel = mongoose.model('cnode_user', userSchema);

module.exports = userModel;