// 配置操作数据库

const mongoose = require('mongoose');

// 数据库连接地址
const dbUrl = 'mongodb://cnode:111111@localhost:27017/cnodejs';

mongoose.connect(dbUrl, (err) => {
  if (err) {
    console.log(err.message);
  }

  console.log('============================================')
  console.log('============================================')
  console.log('==========  connect successfully  ==========')
  console.log('============================================')
  console.log('============================================')
})

module.exports = mongoose;