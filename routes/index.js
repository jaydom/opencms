var express = require('express');
var router = express.Router();
var auth = require('./auth');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '广东轮滑协会' });
});

router.get('/2', function(req, res, next) {
    res.render('index-2', { title: '广东轮滑协会' });
});

router.get('/cert', function(req, res, next) {
    res.render('cert', { title: '认证查询' });
});


router.get('/admin', function(req, res, next) {
    res.render('admin', { title: '后台管理' });
});

module.exports = router;
