// 计算当前时间与标志时间的时间差模块

/**
 * 定义格式化时间的函数
 * @param time: 需要格式化的时间
 *
 */
const setTimeAgo = function (time) {
  let timeStr = '';
  const now = new Date();

  // 格式化成秒
  const timeCha = Math.floor((now - time) / 1000);
  if (timeCha < 1) {
    timeStr = '刚刚';
  } else if (timeCha < 60) {
    timeStr = `${ timeCha }秒前`;
  } else if (Math.floor(timeCha / 60) < 60) {
    timeStr = `${ Math.floor(timeCha / 60) }分钟前`;
  } else if (Math.floor(timeCha / 60 / 60) < 24) {
    timeStr = `${ Math.floor(timeCha / 60 / 60) }小时前`;
  } else if (Math.floor(timeCha / 60 / 60 / 24) < 30) {
    timeStr = `${ Math.floor(timeCha / 60 / 60 / 24) }天前`;
  } else if (Math.floor(timeCha / 60 / 60 / 24 / 30) < 12) {
    timeStr = `${ Math.floor(timeCha / 60 / 60 / 24 / 30) }个月前`;
  } else {
    timeStr = `${ Math.floor(timeCha / 60 / 60 / 24 / 30 / 12) }年前`;
  }

  return timeStr;
};

module.exports = setTimeAgo;

/*
 对于格式化时间：
 1.  哪个模块需要，加载时间处理函数
 2.  将该方法赋值到全局
 res.locals.setTimeAgo =
 */