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
var config = require("./routes/config");
var domain = require("domain");

var db_conf = config.get_db_conf();

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
//指定中国时区
app.use(orm.express("postgres://postgres:mysecretpassword@192.168.56.101:5432/opencms?timezone='CST'", {
//app.use(orm.express("postgres://postgres:mysecretpassword@postgres:5432/opencms?timezone='CST'",{
    define: function (db, models, next) {
        for(var key in db_conf){
            models[key] = db.define(db_conf[key]["table"], db_conf[key]["cols"]);
        }
        next();
    }
}));

app.use('/', index);
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
