//用户获取数据
var express = require('express');
var multiparty=require('multiparty')
var fs=require('fs');
var moment = require('moment');
var router = express.Router();
var loginCheckMiddleware = require('../util').loginCheckMiddleware;
var config = require('../config');
var mysql = require('../util').mysql;
var mysqlTool2=require('../util').mysqlTool2;
var user_id;
var temp_post_count;
router.use(loginCheckMiddleware);

var curTime = moment().format('YYYYMMDDHHmmss');

router.all('*', function (req, res, next) {
  user_id=req.session.user_id;
  temp_post_count=parseInt(req.session.temp_post_count);
  next();
});
//用户获取N条 语音+文字 数据
router.get('/checkItems', function (req, res, next) {
    var wantNumber=req.query.wantNumber;
    //console.log(wantNumber);
    var sqlQuery= `select f.item_id,f.voice_path,f.language_name,g.words from(select d.item_id,d.voice_path,d.words_id,e.language_name from (select c.b_item_id as item_id,c.voice_path,c.words_id, c.language_id from (select a.item_id, b.item_id as b_item_id,b.voice_path ,b.words_id, b.language_id from (select item_id from user_used_history where user_id='${user_id}')as a right join voice_collections as b on a.item_id=b.item_id where b.check_times<20)as c where c.item_id is null order by rand() limit ${wantNumber})as d left join language_dictionary as e on d.language_id= e.language_id)as f left join words_dictionary as g on f.words_id=g.words_id;`;
   
   mysqlTool2(sqlQuery)
   .then(function(result){
     console.log(result)
     var sqlQuery= "select language_name from "
     res.jsonp({
       items:result
     })
   },
   function(e){
    console.log(e)
  });
  
});

module.exports=router;