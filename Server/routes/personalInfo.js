
var express = require('express');
var router = express.Router();
var loginCheckMiddleware = require('../util').loginCheckMiddleware;
var mysql = require('../util').mysql;
var only = require('../util').only;
var languageDictionaryTable = 'language_dictionary';
var userBasicInfoTable='user_basic_info';
var sessionTable="session"

var user_id;
router.use(loginCheckMiddleware);

router.all('*', function (req, res, next) {
  user_id=req.session.user_id;
  next();
});
router.get('/languageSelect/showAll', function (req, res, next) {
   
    mysql(languageDictionaryTable)
        .select("language_name")
        .then(function(result){
            console.log("查询所有语言种类返回示例，res[0]：")
            console.log(result[0]);
            res.json({
                data:result
              });
            return ;
        })
        .catch(e => {
          console.log("连接数据库userBasicInfoTable失败")
          console.log(e)
          res.json({
            data: false
          });
        });
});
router.get('/languageSelect/userSlected', function (req, resp, next) {
   console.log("/languageSelect/userSlected <<req.body.userSlectedLanguage")
   console.log(req.query)
   var language_id;
  mysql(languageDictionaryTable)
      .select("language_id")
      .where({
        language_name:req.query.userSlectedLanguage
      })
      .then(function(res){//方言的ID (int)
        console.log(res);
        language_id=res[0].language_id;
        return language_id;
      })
      .then(function(language_id){
        return mysql(userBasicInfoTable)
        .update({"language_id":language_id})
        .where({
          user_id:user_id
        })
        .then(function(res){
          console.log(res)
          resp.json({
            success: true
          });
        })
      })
      .catch(e => {
        console.log("连接数据库失败")
        console.log(e)
        resp.json({
          success: false
        });
      });
      
     
    
});
router.get('/avatarAndName/set', function (req, res, next) {
  console.log("/avatarAndName/set >> req.query:")
  console.log(req.query);
    mysql(userBasicInfoTable)
    .update({
      avatar:req.query.avatar,
      nickname:req.query.name,
    })
    .where({user_id:user_id})
    .then(function (result) {
      console.log("更改头像昵称返回值：")
      console.log(result)
      if(result){
        res.json({
          success: true//更改成功
        });
      }else{
        res.json({
          success: false//更改失败
        });
      }
    })
    .catch(e => {
      console.log("连接数据库userBasicInfoTable失败")
      console.log(e)
      res.json({
        success: false
      });
    });
});
router.get('/basicInfo/get',  (req, res, next)=> {
    mysql(userBasicInfoTable)
    .select("*")
    .where({user_id:user_id})
    .then( (result)=> {
      console.log(result)
      if(result){
        res.json({
          success: true,//
          personInfo:result[0]
        });
      }else{
        res.json({
          success: false//
        });
      }
    })
    .catch(e => {
      console.log("连接数据库userBasicInfoTable失败")
      console.log(e)
      res.json({
        success: false
      });
    });
});

module.exports = router;