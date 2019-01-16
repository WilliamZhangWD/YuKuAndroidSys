var moment = require('moment');
var config = require('./config');
var sessionTable = 'session';
var originalMysql=require('mysql');//用了两种数据库连接方式，一种是knex，另一种是原始的mysql，支持复杂操作 
var mysql = require('knex')({
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
var pool=originalMysql.createPool({
  connectionLimit : 50,
  multipleStatements : true,
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.pass,
  database: config.mysql.db,
  charset: config.mysql.char
});
var mysql2=(sql)=>{
       return new Promise(function(resolve,reject){
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
  mysql: mysql,
  loginCheckMiddleware: loginCheckMiddleware,
  only,
  mysqlTool2:mysql2
};