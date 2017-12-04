const mongoose = require('../config/db_config');

const cateSchema = new mongoose.Schema({
  // 分类名称
  catename: {
    type: String,
    unique: true
  },
  // 排序，越小越靠前
  ordernum: {
    type: Number,
    default: 999
  },
  // 选项，从话题身上关联现在的分类的标志，
  // 唯一
  tab: {
    type: String,
    unique: true
  }
})

const cateModel = mongoose.model('cnode_cate', cateSchema);

module.exports = cateModel;

// 手动插入

// const cates = [
//   {
//     catename: '分享',
//     ordernum: 1,
//     tab: 'share'
//   },
//   {
//     catename: '问答',
//     ordernum: 2,
//     tab: 'ask'
//   },
//   {
//     catename: '招聘',
//     ordernum: 3,
//     tab: 'job'
//   },
//   {
//     catename: '客户端测试',
//     ordernum: 4,
//     tab: 'dev'
//   },
// ];
//
// cateModel.create(cates, (err, msg) => {
//
// })
