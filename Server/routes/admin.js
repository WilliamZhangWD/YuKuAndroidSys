var express = require('express');
var router = express.Router();

router.all('*', function (req, res, next) {
  if (!req.session) {
    res.status(401).json({//还没登入
      error: '未登录'
    });
    return;
  }
  next();
});
router.get('/login', function (req, res) {
   
});

module.exports = router;