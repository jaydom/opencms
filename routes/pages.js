/**
 * Created by chenqianfeng on 2017/6/14.
 */
var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/login.html', function(req, res, next) {
    res.sendFile('login.html', { root: path.join(__dirname, '../views/app/pages') });
    //res.sendFile('views/app/pages/login.html');
});

module.exports = router;