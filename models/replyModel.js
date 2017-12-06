const mongoose = require('../config/db_config');

const replySchema = new mongoose.Schema({
  // 内容
  content: String,
  // 谁回复的
  user: {
    type: 'ObjectId',
    ref: 'cnode_user',
  },
  // 被回复的话题
  topic: {
    type: 'ObjectId',
    ref: 'cnode_topic',
  },
  // 回复的时间
  replyTime: {
    type: Date,
    default: Date.now,
  },
  // 楼层
  lou: {
    type: Number
  },
  zan: [
    {
      type: 'ObjectId',
      ref: 'cnode_user'
    }
  ]
});

const replyModel = mongoose.model('cnode_reply', replySchema);

module.exports = replyModel;