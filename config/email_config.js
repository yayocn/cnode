// 邮件模块

/* 借助第三方
   smtp.qq.com
   smtp.163.com
   smtp.126.com
 */

const nodemailer = require('nodemailer');


// POP3/SMTP: ivetrnxwcgzwbbia
// IMAP/SMTP: teeiooksctsybdgg
let transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: 'yayocn@qq.com',
    pass: 'teeiooksctsybdgg'
  }
})

let sendMail = (username, id, email, callback) => {
  let content = '尊敬的'+ username + '您好，请单击<a href="http://localhost:3000/verifyEmail/?_id='+ id +'">激活邮箱</a>';

  let mailOptions = {
    from: '"呀哟" <yayocn@qq.com>',
    to: email,
    subject: 'cnode官网激活邮件',
    html: content
  }

  transporter.sendMail(mailOptions, (error, info) => {
    callback(error);
  })
}

module.exports = sendMail;

