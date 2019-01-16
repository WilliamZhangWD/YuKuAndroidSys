var express = require('express');
var request = require('request');
var crypto = require('crypto');
var moment = require('moment');
var router = express.Router();
var config = require('../config');
var mysql = require('../util').mysql;
var sessionTable = 'session';
var userBasicInfoTable='user_basic_info';

function sha1(message) {
  return crypto.createHash('sha1').update(message, 'utf8').digest('hex');
}

router.get('/', function (req, res, next) {

  var code = req.query.code;
  var curTime = moment().format('YYYY-MM-DD HH:mm:ss');

  request.get({
    uri: 'https://api.weixin.qq.com/sns/jscode2session',
    json: true,
    qs: {
      grant_type: 'authorization_code',
      appid: config.appid,
      secret: config.secret,
      js_code: code
    }
  }, function (err, response, data) {
    if (response.statusCode === 200) {
      var sessionKey = data.session_key;
      var openId = data.openid;
  
      var skey = sha1(sessionKey);
      console.log("skey:")
      console.log(skey);
      var sessionData = {
        skey: skey,
        create_time: curTime,
        last_login_time: curTime,
        session_key: sessionKey,
        temp_post_count:0
      };

      //检查用户是否注册，若无，则注册
      mysql(userBasicInfoTable).count('user_id as hasUser').where({
        user_id: openId
      }).then(function(res){
        console.log("查询用户是否注册结果:")
        console.log(res);
        if (!res[0].hasUser) {
          console.log("不存在该注册用户")
          var register={
            user_id : openId,
            award_points:0,
            sum_points:0,
            reported_times:0,
            register_time:curTime,
            lastest_logon_time:curTime
          }
          return mysql(userBasicInfoTable).insert(register);
        } 
        
      }).then(function(){
        console.log("注册用户成功")
        mysql(sessionTable).count('user_id as hasUser').where({
          user_id: openId
        })
          .then(function(res) {
            // 如果存在用户就更新session
           
            console.log("res:")
            console.log(res)
            if (res[0].hasUser) {
              console.log("存在session用户:")
              return mysql(sessionTable).update(sessionData).where({
                user_id: openId
              });
            } 
            // 如果不存在用户就新建session
            else {
              console.log("不存在session用户:")
              sessionData.user_id = openId;
              return mysql(sessionTable).insert(sessionData);
            }
          })
          .then(function() {
            console.log("插入session用户成功")
            res.json({
              skey: skey
            });
          })
          .catch(e => {
            console.log("连接数据库sessionTable失败")
            console.log(e)
            res.json({
              skey: null
            });
          });
      })
      .catch(e => {
        console.log("连接数据库userBasicInfo失败")
        console.log(e)
      });
    } else {
      console.log("连接微信官方失败")
      res.json({
        skey: null
      });
    }
  });
});

module.exports = router;
