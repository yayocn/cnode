const cateModel = require('../models/cateModel');
const topicModel = require('../models/topicModel');
const userModel = require('../models/userModel');
const replyModel = require('../models/replyModel');

const setTimeAgo = require('../config/setTimeAgo_config');
const ep = require('eventproxy')();

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


    /*
     最终的目的：
     1. 响应当前话题相关数据
     2. 响应无人回复的话题
     3. 响应作者的其他话题
     */
    // 监听事件
    ep.all('topicData', 'zeroReply', 'replyData', (data, zeroReplyData, replyData) => {
      if (!data.topicData) {
        res.render('tip', { errMsg: '此话题不存在或者已被删除！'})
      } else {
        res.render('topicShow', { topicData: data.topicData, otherData: data.otherData, zeroReplyData: zeroReplyData, replyData });
      }
    });

    // 访问量 +1
    topicModel.update(con, { $inc: { viewNum: 1 }}, (err, msg) => {
      // 查询话题详情
      topicModel.findOne(con)
      // 关联查询
        .populate('cate', { catename: 1 })
        .populate('user',{ userpic: 1, username: 1, score: 1, mark: 1 })
        .exec((err, data) => {
          // 响应模板，分配数据
          if (data) {
            // 查询当前话题的所有回复
            replyModel.find({ topic: req.params._id }).populate('user', { username: 1, userpic: 1, zan: 1 }).exec((err, data) => {
              console.log(data)
              ep.emit('replyData', data);
            })

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

              ep.emit('topicData', { topicData: data, otherData: otherData })
            })
          } else {
            ep.emit('topicData',{ topicData: null });
          }
        })
    })

    // 查询无人回复的话题
    const conNoRelpy = {
      reply: { $size: 0 }
    }

    topicModel.find(conNoRelpy, { title: 1 }, {
      sort: { createTime: -1 },
      limit: 5
    }, (err, data) => {
      ep.emit('zeroReply', data);
    })
  },
  reply (req, res) {
    const con = {
      _id: req.params._id
    };

    topicModel.findOne(con, { reply: 1 }, (err, data) => {
      const replyData = {
        content: req.body.content,
        user: req.session.user._id,
        topic: req.params._id,
        lou: data.reply.length + 1,
      };

      replyModel.create(replyData, (err, msg) => {
        // msg 返回来当前产生数据的_id
        topicModel.update(con, { $push: { reply: msg._id }}, (err) => {
          if (!err) {
            res.redirect('back');
          }
        })
      })
    })
  },
  collect (req, res) {
    if (!req.session.user) {
      res.send('nologin');
      return;
    }
    
    // 当前用户
    const con = {
      _id: req.session.user._id
    };

    if (req.session.user.collect.indexOf(req.params._id) < 0) {
      const newData = {
        $push: {
          collect: req.params._id
        }
      };

      userModel.update(con, newData, (err) => {
        if (err) {
          res.send('error');
        } else {
          req.session.user.collect.push(req.params._id);
          res.send('collectok');
        }
      })
    } else {
      const newData = {
        $pull: {
          collect: req.params._id
        }
      };

      userModel.update(con, newData, (err) => {
        if (err) {
          res.send('error');
        } else {
          req.session.user.collect.splice(req.session.user.collect.indexOf(req.params._id), 1);
          res.send('cancelok');
        }
      })
    }
  },
  zan (req, res) {
    if (!req.session.user) {
      res.send('nologin');
      return;
    }

    const con = {
      _id: req.query._id,
      zan: req.session.user._id
    };

    replyModel.findOne(con, (err, data) => {
      if (data) {
        // 已经点赞了, 需要取消
        const con = {
          _id: req.query._id
        };
        const newData = {
          $pull: {
            zan: req.session.user._id
          }
        };
        replyModel.update(con, newData, (err, msg) => {
          if (!err) {
            res.send('cancel');
          }
        })
      } else {
        // 没有点赞, 添加
        const con = {
          _id: req.query._id
        };
        const newData = {
          $push: {
            zan: req.session.user._id
          }
        };
        replyModel.update(con, newData, (err, msg) => {
          if (!err) {
            res.send('ok');
          }
        })
      }
    })
  }
}

module.exports = topic;