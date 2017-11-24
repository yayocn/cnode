// 该文件是定义文件上传模块

// 加载模块
var multer = require('multer');
var timeStamp = require('time-stamp');
var uid = require('uid');
var path = require('path');

/**
 * 定义文件上传的函数 uploadFile()
 * @param string savePath 文件存储的路径
 * @param array allowType 允许上传的文件类型
 * @param number fileMaxSize 允许上传的文件的最大值
 */
function uploadFile(savePath, allowType, fileMaxSize) {
  // 定义文件存储的引擎
  var storage = multer.diskStorage({
    // 文件存储的位置
    destination: savePath,
    // 文件名的命名规则
    filename: function (req, file, cb) {
      // 扩展名
      var extname = path.extname(file.originalname);
      // 文件名
      var filename = timeStamp('YYYYMMDDHHmmssms') + uid(10) + extname;

      // 进行存储
      cb(null, filename);
    }
  });

  // 定义文件过滤函数
  function fileFilter(req, file, cb) {
    // 文件的类型 file.mimetype
    if (allowType.indexOf(file.mimetype) != -1) {
      // 进行存储
      cb(null, true);
    } else {
      // 不在指定的范围内

      // 传递错误信息
      var err = new Error();
      err.code = 'fileFilter';	// 我自己人为约定的
      cb(err);		// 传递错误信息

      //  不存储
      // cb(null,false);
    }
  }


  // 定义存储的对象
  var upload = multer({
    // 存储引擎
    storage: storage,

    // 文件类型约束
    fileFilter: fileFilter,

    // 文件大小
    limits: {
      fileSize: fileMaxSize
    }
  });

  // 返回upload对象
  return upload;
}

// 将定义的文件上传模块向外暴露
module.exports = uploadFile;