var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash')

var index = require('./routes/index');
var user = require('./routes/user');
var topic = require('./routes/topic');

const setTimeAgo = require('./config/setTimeAgo_config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

// 定义session中间件
app.use(session({
  // 加密字符串
  secret: 'asdfasdfasdf',
  rolling: true,
  resave: true,
  cookie: {
    path: '/',
    maxAge: 1000 * 60 * 30
  }
}))

// 定义传递一次性消息的中间件
app.use(flash());


// 将session相关信息存储到本地对象
app.use((req, res, next) => {
  res.locals.user = req.session.user;

  // 存储错误信息
  res.locals.errMsg = req.flash('errMsg');

  // 密码错误信息
  res.locals.pwdErrorMsg = req.flash('pwdErrorMsg');

  // 密码修改成功
  res.locals.setPwdOk = req.flash('setPwdOk');

  // 设置时间格式化函数
  res.locals.setTimeAgo = setTimeAgo;

  // 移交权限
  next();
})

app.use('/', index);
app.use('/user', user);
app.use('/topic', topic);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
