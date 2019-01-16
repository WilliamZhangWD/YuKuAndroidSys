//用户检查语音数据
var express = require('express');
var moment = require('moment');
var router = express.Router();
var loginCheckMiddleware = require('../util').loginCheckMiddleware;
var config = require('../config');
var mysql = require('../util').mysql;
var only = require('../util').only;
var user_id;
var temp_post_count;
var curTimeForSingle = moment().format('YYYY-MM-DD HH:mm:ss');
var curTime = moment().format('YYYYMMDDHHmmss');
var userUsedHistoryTable="user_used_history";
var voiceCollectionsTable="voice_collections";


router.use(loginCheckMiddleware);
router.all('*', function (req, res, next) {
  user_id=req.session.user_id;
  temp_post_count=parseInt(req.session.temp_post_count);
  next();
});
//用户检验数据 语音+标签+判断
router.post('/checkItems', function (req, res, next) {//req里有item_id 判断结果
  //1.加入到user_used_history
  //2.更新voice_collections的check_times和correct_times
  var item_id=req.body.item_id;
  var TOF=req.body.TOF;
  var count=2;//计数，两个数据库操作都为未错，返回前端成功
  mysql(userUsedHistoryTable)
  .insert({
    user_id:user_id,
    item_id:item_id,
    check_result:TOF,
    check_time:curTimeForSingle
  })
  .then(function(result){
    count--;
    if(count==0){
      res.json({
        success:true
      })
    }
  })
  .catch(e=>{
    console.log(e);
    
    res.json({
      success:false
    })
  })

  mysql(voiceCollectionsTable)
  .select("correct_times","check_times")
  .where({item_id:item_id})
  .then(function(result){//correct_times + check_times
    return mysql(voiceCollectionsTable)
    .update({
      check_times:result[0].check_times+1,
      correct_times:result[0].correct_times+(TOF?1:0),
    })
    .then(function(result){
      count--;
      if(count==0){
        res.json({
          success:true
        })
      }
    })
  })
  .catch(e=>{
    console.log(e);
    res.json({
      success:false
    })
  })  
 

});


module.exports = router;