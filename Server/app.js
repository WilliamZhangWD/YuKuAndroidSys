var express = require('express');
var path=require('path')
var bodyParser = require('body-parser');
var session =require("express-session");
var multiparty=require('multiparty')
var md5=require('md5-node')
var fs=require('fs');

var config = require('./config');
var lessonConfig = require('./lesson');
var login = require('./routes/login');
var personalInfo = require('./routes/personalInfo');
var userCheck = require('./routes/userCheck');
var userPost = require('./routes/userPost');
var userGet = require('./routes/userGet');

var app = express();
var port = config.port;//监听端口

app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:true,
    rolling:true,
}))  
//配置bodyParser中间件
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//所有关于页面的静态文件地址
app.use(express.static(path.join(__dirname,'upload/voiceFiles')))
app.all('*', function(req, res, next) { 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    res.header('Access-Control-Allow-Credentials', true);
    next();
    });

app.get('/', function (req, res) {
    res.send("你好，这里是语酷Android！cool！");
});
/*
以下路由重写
*/
//app.use('/api/user/login', login);//登录
//app.use('/api/user/personal/', personalInfo);//用户信息
//app.use('/api/user/userCheck/', userCheck);//用户审题
//app.use('/api/user/userPost', userPost);//用户提交
//app.use('/api/user/userGet', userGet);//用户获取多组语音数据

app.use(function(req, res, next) {
    res.status(404).json({
        error: '资源未找到'
    });
});
app.use(function(error, req, res, next) {
    console.log(error);
    res.status(500).json({
        error: '服务器内部错误'
    });
});
app.listen(port, function(error) {
    if(error) {
        console.log('error!');
    }
    else {
        console.log("Server start! Listening on localhost:" + port);
    }
});