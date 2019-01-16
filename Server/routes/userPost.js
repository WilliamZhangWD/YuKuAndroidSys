//用户提交的语音数据
var express = require('express');
var multiparty=require('multiparty')
var fs=require('fs');
var moment = require('moment');
var router = express.Router();
var loginCheckMiddleware = require('../util').loginCheckMiddleware;
var config = require('../config');
var mysql = require('../util').mysql;
var only = require('../util').only;
var user_id;
var temp_post_count;
router.use(loginCheckMiddleware);

var curTime = moment().format('YYYYMMDDHHmmss');

router.all('*', function (req, res, next) {
  user_id=req.session.user_id;
  temp_post_count=parseInt(req.session.temp_post_count);
  next();
});
//用户提交一条 语音+文字 数据
router.post('/singleItem/postNewItem', function (req, res, next) {//接收一个语音+标签进行存储
  temp_post_count+=1;
  var dataId=curTime+"_"+user_id+"_"+temp_post_count
  var form=new multiparty.Form();
  form.uploadDir=config.uploadFileDir;//目录必须存在
  form.parse(req,function(err,fileds,files){
    if(err) throw err
    var keys=Object.keys(files);
    
    var oldFileName=files[keys[0]][0].path;
    var chineseMeaning=keys[0];
    console.log("中文意思：")
    console.log(chineseMeaning)
    var newFileName=config.uploadFileDir+dataId+".aac";
    console.log(newFileName)
    fs.renameSync(oldFileName,newFileName);
    mysql(config.sessionTable)
    .update({
      temp_post_count:temp_post_count
    })
    .where({user_id:user_id})
    .then(function(result){//更改计数
      if(result){
        console.log("计数成功！")
        return mysql(config.wordsDictionaryTable)//
        .select("words_id")
        .where({words:chineseMeaning})
        .then(result=>{
          console.log("检索文字成功，结果为：")
          console.log(result)
          return result;
        })
      }
      else{
        throw new Error('更改计数失败')
      }
    })
    .then(function(result){//文字查询结果
      if(!result[0]){//文字不存在，插入文字
        return mysql(config.wordsDictionaryTable)//插入
        .insert({
          words_id:dataId,
          words:chineseMeaning,
        })
        .then(function(result){
          console.log(result)
          return dataId
        })
      }
      else{//文字存在，输出words_id
        return result[0].words_id;
      }
      
    })
    .then(function(words_id){//文字id
        return mysql(config.userBasicInfoTable)//
        .select("language_id")
        .then(function(language_ids){
          return {
            words_id:words_id,
            language_id:language_ids[0].language_id
          }
          
        })
      
    })
    .then(function(result){//result为文字的id 插入语音数据到数据库
      return mysql(config.voiceCollectionsTable)
      .insert({
        item_id:dataId,
        voice_path:dataId+".acc",
        words_id: result.words_id,
        user_id:user_id,
        language_id:result.language_id,
        correct_times:0,
        check_times:0
      })
      .then(function(result){
        if(result){
          console.log("插入语音数据成功！");
          res.json({
            success: true
          });
        }
      })
      
    })
    .catch(e=>{
      console.log("出错：")
      console.log(e);
      res.json({
        success:false
      })
    })
    
  });
    
});

module.exports = router;