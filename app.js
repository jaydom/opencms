var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var orm = require("orm");

var index = require('./routes/index');
var users = require('./routes/users');
var menus = require('./routes/menus');
var pages = require('./routes/pages');
var files = require('./routes/files');
var certs = require('./routes/certs');
var datas = require('./routes/datas');
var domain = require("domain");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use(function (req,res, next) {
    var d = domain.create();
    //监听domain的错误事件
    d.on('error', function (err) {
        console.error(err);
        res.statusCode = 500;
        res.json({sucess:false, messag: '服务器异常'});
        d.dispose();
    });

    d.add(req);
    d.add(res);
    d.run(next);
});

app.use(orm.express("postgres://postgres:mysecretpassword@192.168.56.101:5432/opencms", {
    define: function (db, models, next) {
        models.User = db.define("user", {
            id          :Number,
            name        :String,
            password    :String
        });
        models.Certificate = db.define("T_certificate", {
            id          :Number,
            player_id  :Number,
            player_name :String,
            exam_type   :String,
            exam_level       :Number,
            exam_address     :String,
            exam_time        :Date,
            cert_id          :Number,
            cert_time        :Date,
            club             :String,
            cert_image      :String,
            cert_image_md5  :String,
            exam_area      :String,
            sex  :String,
            tel  :String,
            idcard :String
        });
        next();
    }
}));

app.use('/', index);
app.use('/2', index);
app.use('/cert', certs);
app.use('/admin', index);
app.use('/app/pages', pages);
app.use('/api/account', users);
app.use('/api/menu', menus);
app.use('/api/file', files);
app.use('/api/db', datas);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
