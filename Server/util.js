var moment = require('moment');
var config = require('./config');
var sessionTable = 'session';
//用了两种数据库连接方式，一种是knex,适合小操作，方便简单，另一种是原始的mysql ，适合复杂操作 
var mysqlTool=require('mysql');//第一种mysql方法  
var pool=mysqlTool.createPool({
  connectionLimit : 50,
  multipleStatements : true,
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.pass,
  database: config.mysql.db,
  charset: config.mysql.char
});
var mysql=(sql)=>{
       return   new Promise(function(resolve,reject){
           pool.getConnection(function(err,connection){
              if(err){
                reject(err);
                return; 
              }
              connection.query( sql , [] , function(error,res){
                connection.release();
                if(error){
                  reject(error);
                  return;
                }
                resolve(res);
              });
           });
       });
    };

var knex = require('knex')({//第二种mysql方法
  client: 'mysql',
  connection: {
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.db,
    charset: config.mysql.char
  }
});
    
var loginCheckMiddleware = function (req, res, next) {
  //console.log("loginCheckMiddleware_req headers");
  //console.log(req.headers)

  var skey = req.headers.skey;
  req.session=Object.assign( req.session,{"legal":false});
  if(!skey) {
    res.status(401).json({
      error: '未包含skey'
    });
  }

  mysql(sessionTable).select('*').where({
    skey: skey
  })
    .then(function (result) {
      if (result.length > 0) {
        var session = result[0];
        console.log("数据库里得到的session:")
       // console.log(session)
        var lastLoginTime = session.last_login_time;
        var expireTime = config.expireTime * 1000;

        if (moment(lastLoginTime, 'YYYY-MM-DD HH:mm:ss').valueOf() + expireTime > +new Date) {// +new Date等价于new Date().valueOf()和new Date().getTime()
          console.log("req.session:")
          //console.log(session)
          req.session = Object.assign(req.session,session);
          next();//唯一出口
        }
        else{
          res.status(401).json({
            error: '登录超时'
          });
        }
        
      }
      else{
        console.log("出2")
        res.status(401).json({
          error: '不合法'
        });
        
      }
    })
    .catch(function (e) {
      console.log(e)
      return
    });

};

function only(obj, keys) {
  obj = obj || {};
  if ('string' == typeof keys) keys = keys.split(/ +/);
  return keys.reduce(function (ret, key) {
    if (null == obj[key]) return ret;
    ret[key] = obj[key];
    return ret;
  }, {});
};

module.exports = {
  knex: knex,
  mysql:mysql,
  loginCheckMiddleware: loginCheckMiddleware,
  only
  
};