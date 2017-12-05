const cateModel = require('../models/cateModel');
const topicModel = require('../models/topicModel');
const userModel = require('../models/userModel');

const setTimeAgo = require('../config/setTimeAgo_config');

const topic = {
  index (req, res) {
    res.send('话题');
  },
  create (req, res) {
    // 查找所有话题分类
    cateModel.find({}, {}, {
      // 描述 规则
      sort : {
        ordernum : 1
      }
    }, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.render('topicCreate', { cateData: data});
      }
    })
  },
  doCreate (req, res) {
    const data = {
      title: req.body.title,
      content: req.body.content,
      cate: req.body.cate,
      user: req.session.user._id
    }

    topicModel.create(data, (err, msg) => {
      // 话题创建成功后，向详情页跳转

      // 增加用户积分
      const con = {
        _id: req.session.user._id
      }

      userModel.update(con, {$inc:{'score': 5}}, (err, data) => {
        if (err) {

        } else {
          // 更新成功
          req.session.user.score += 5;
          res.redirect(`/topic/${ msg._id }`);
        }
      })
    })
  },
  show (req, res) {
    /*
     以传递的_id为条件，查询该话题的详情
     1. 话题中所有的数据
     2. 话题作者的信息：头像、账户名、积分、签名
     3. 获取该话题所属的分类
     */

    const con = {
      _id: req.params._id
    };

    /*
     当访问该页面时：
     1. 每访问一次，那么浏览量必须+1 viewNum+1
     2. 发布时间格式化
     刚刚(3s以内)
     几秒前(10s以内)
     几分钟前(1分钟-60分钟)
     几小时前(1小时-24小时)
     几天前(1天-30天)
     几个月前(1个月-12个月之前)
     几年前(大于1年)

     3. 作者的其他话题如何来获取!
     4. 无人回复的话题，是如何考虑的！
     */

    // 访问量 +1
    topicModel.update(con, { $inc: { viewNum: 1 }}, (err, msg) => {
      // 查询话题详情
      topicModel.findOne(con)
      // 关联查询
        .populate('cate', { catename: 1 })
        .populate('user',{ userpic: 1, username: 1 })
        .exec((err, data) => {
          // 响应模板，分配数据
          if (data) {
            // 当前用户的其他话题
            const conOther = {
              // 话题发布者
              user: data.user._id,
              // 不是当前话题
              _id: { $ne: req.params._id }
            }

            topicModel.find(conOther, { title: 1 }, {
              sort: { createTime: -1 },
              limit: 5
            }, (err, otherData) => {
              // 单个的话，可以把setTimeAgo函数这样传过去，但是对于列表就不合适了
              // res.render('topicShow', { topicData: data, setTimeAgo: setTimeAgo })

              res.render('topicShow', { topicData: data, otherData: otherData });
            })
          } else {
            res.render('tip', { errMsg: '此话题不存在'})
          }
        })
    })

  }
}

module.exports = topic;