var express = require('express');
var crypto = require('crypto');
var moment = require('moment');
var router = express.Router();
var config = require('../config');
var knex = require('../util').knex;
var mysql = require('../util').mysql;
router.post('/', async function (req, res, next) {
console.log("req.body");
console.log(req.body);
  //post的参数
  var PostedAccount = req.body.account;
  var PostedPassword = req.body.password;
  //var curTime = moment().format('YYYY-MM-DD HH:mm:ss');
  var countSql = `select count(user_id)as count from ${config.userTable} where user_id= "${PostedAccount}" and secret="${PostedPassword}"` ;
  var count=0;
  await mysql(countSql)
      .then(function(result){          
          console.log(result[0]);
          count=result[0].count;       
      })
      .catch(e => {
        console.log("连接数据库失败-user")
        console.log(e)
        count=-1;
      });
  res.json({
    code: 0,
    msg: '请求成功',
    success: count //大于0表示密码账号正确，等于0表示错误，-1表示数据库连接失败
  })   
});
module.exports = router;
