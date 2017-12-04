const mongoose = require('../config/db_config');

const topicSchema = mongoose.Schema({
  title: {
    type: String
  },
  cate : {
    type : 'ObjectId',
    // ref关联模型,关联话题分类
    ref : 'cnode_cate'
  },
  content: {
    type: String
  },
  user: {
    // 存储和用户关联的唯一标识
    type: 'ObjectId',
    ref: 'cnode_user'
  },
  createTime: {
    type: Date,
    default: Date.now
  },
  // 是否置顶
  top: {
    type: Boolean,
    default: false
  },
  // 是否是精华
  good : {
    type : Boolean,

    // 默认不是精华
    default : false
  },
  // 话题访问的数量
  viewNum : {
    type : Number,
    default :0
  },
  // 创建reply,是一个数组
  reply : [
    // 每一个单元单元中存储的都是回复集合中的_id
    {
      type : 'ObjectId',
      // 关联回复集合
      ref : 'cnode_reply'
    }
  ]
});

const topicModel = mongoose.model('cnode_topic', topicSchema);

module.exports = topicModel;