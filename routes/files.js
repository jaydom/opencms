/**
 * Created by chenqianfeng on 2017/6/21.
 */
var express = require('express');
var router = express.Router();
var auth = require('./auth');
var multiparty  = require('multiparty');
var fs= require('fs');
var util = require('util');
var xl = require('node-xlrd');
var D = require("domain");
var exec = require('child_process').exec;
var moment = require('moment');
var certificate_parser = require('../sheet_parser/Certificate');
var apply_parser = require('../sheet_parser/Apply');
var sheet_parser = {
    "Certificate": certificate_parser,
    "Apply": apply_parser
}

function handle_sheet(req,table_name,sht,cb) {
    var rCount = sht.row.count,
        cCount = sht.column.count;
    //解析文件
    if(typeof sheet_parser[table_name] == 'undefined'){
        cb("不支持批量上传");
    }else{
       sheet_parser[table_name].parse(req,sht,function (err,datas) {
            if(err!=null){
                cb(err);
            }else{
                //保存数据库
                console.log(datas);
                req.models[table_name].create(datas, function(err, results) {
                    if(err){
                        console.log(err);
                        cb("数据库错误");
                    }else{
                        cb(null);
                    }
                });
            }
        });
    }
}
router.all('/', auth.isValid);

router.get('/list', function(req, res, next) {
    req.models.Certificate.find({ player_name: req.query.user_name }).run(function(err, users){
        if(err){
            //res.send(err);
            console.log(err);
            res.render('cert-result', { title: '考证结果',result:"系统错误" ,images:"comeon.jpg"});
        }else{
            if (users.length>0){
                var image_path = users[0].cert_id + ".jpg";
                res.render('cert-result', { title: '考证结果',result:"考证通过" ,images:image_path});
            }else{
                res.render('cert-result', { title: '考证结果',result:"考证未通过" ,images:"comeon.jpg"});
            }
            console.log(JSON.stringify(users))
        }
    });
});

router.post('/:table_name', function(req, res, next) {
    console.log(req.body, req.files);
    var table_name = req.params["table_name"];
    //生成multiparty对象，并配置下载目标路径
    var form = new multiparty.Form({uploadDir: './public/files/'});
    //下载后处理
    form.parse(req, function(err, fields, files) {
        var filesTmp = JSON.stringify(files,null,2);
        if(err){
            console.log('parse error: ' + err);
            res.statusCode = 500;
            res.json({success:false, messag: '上传失败'});
        } else {
            console.log('parse files: ' + filesTmp);
            var inputFile = files.file[0];
            var uploadedPath = inputFile.path;
            var dstPath = './public/files/' + inputFile.originalFilename;
            //解析文件
            xl.open(uploadedPath, function(err,bk){
                if(err) {
                    console.log(err.name, err.message);
                    res.statusCode = 500;
                    res.json({success:false, messag: '解析失败'});
                }else{
                    var shtCount = bk.sheet.count;
                    for(var sIdx = 0; sIdx < shtCount; sIdx++ ){
                        console.log('sheet "%d" ', sIdx);
                        console.log('  check loaded : %s', bk.sheet.loaded(sIdx) );
                        var sht = bk.sheets[sIdx],
                            rCount = sht.row.count,
                            cCount = sht.column.count;
                        console.log('  name = %s; index = %d; rowCount = %d; columnCount = %d', sht.name, sIdx, rCount, cCount);
                        handle_sheet(req,table_name,sht,function (err) {
                            if(err){
                                console.log(err);
                                res.statusCode = 400;
                                res.json({success:false, message: err});
                            }else{
                                res.statusCode = 200;
                                res.json({success:true, message: '上传成功'});
                            }
                        });
                    }
                }
            });
        }
    });
});


module.exports = router;