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

function isValidFormat(sheet,cCount){
    var table_headers = ["序号","颁证日期","证书编号","考试时间","考区","考场","报考项目","报考等级","姓名","性别","身份证号码","联系电话","所属培训单位"];
    //判断长度
    if (table_headers.length>cCount){
        return -1;
    }
    //比较表头
    for (var sIdx =0; sIdx< table_headers.length; sIdx++ ){
        if (table_headers[sIdx]!=sheet.cell(1,sIdx) ){
            return -1;
        }
    }
    return 2;
}

function insertDatas(req,sheet,rIdx){
    var newRecord = {};
    newRecord.id = sheet.cell(rIdx,0);
    newRecord.cert_time         = sheet.cell(rIdx,1);
    newRecord.cert_id           = sheet.cell(rIdx,2);
    newRecord.exam_time         = sheet.cell(rIdx,3);
    newRecord.exam_area= sheet.cell(rIdx,4);
    newRecord.exam_address      = sheet.cell(rIdx,5);
    newRecord.exam_type   = sheet.cell(rIdx,6);
    newRecord.exam_level     = sheet.cell(rIdx,7);
    newRecord.player_name     = sheet.cell(rIdx,8).toString().trim();
    newRecord.sex     = sheet.cell(rIdx,9);
    newRecord.idcard     = sheet.cell(rIdx,10);
    newRecord.tel     = sheet.cell(rIdx,11);
    newRecord.club     = sheet.cell(rIdx,12);
    newRecord.cert_image       = ""
    newRecord.cert_image_md5   = ""
    req.models.Certificate.create(newRecord, function(err, results) {
        if(err){
            //console.error(err);
        }else{
            console.log("insert success");
        }
    });
}

function toMoment(timeStamp) {
    return moment(timeStamp * 1000);
}

function build_certimage(req,sheet,rIdx){
    var arg1 = sheet.cell(rIdx,7).toString().trim(); //levle
    var arg2 = sheet.cell(rIdx,9).toString().trim(); //sex
    var arg3 = sheet.cell(rIdx,4).toString().trim(); //exam_area
    var arg4 = sheet.cell(rIdx,2).toString().trim(); //cert_id
    var arg5 = sheet.cell(rIdx,10).toString().trim(); //IDCard_id
    var arg6 = moment(sheet.cell(rIdx,3)).format("YYYY-MM-DD"); //exam_time
    var arg7 = moment(sheet.cell(rIdx,1)).format("YYYY-MM-DD");//cert_time
    var arg8 = sheet.cell(rIdx,8).toString().trim(); //player_name
    console.log('python image_builder/build_images.py '+ arg1+' '+arg2+' '+ arg3+' '+arg4+' '+arg5+' '+arg6+' '+arg7+' '+arg8);
    exec('python image_builder/build_images.py '+ arg1+' '+arg2+' '+ arg3+' '+arg4+' '+arg5+' '+arg6+' '+arg7+' '+arg8,function(error,stdout,stderr){
        if(stdout.length >0){
            console.log(stdout);
        }
        if(error) {
            console.info('stderr : '+stderr);
        }
    });
}

router.all('/', auth.isValid);

router.get('/list', function(req, res, next) {
    console.log(req.query.user_name);
    console.log(req.query.user_idcard);
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

router.post('/', function(req, res, next) {
    console.log(req.body, req.files);
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
                        var start_Idx = isValidFormat(sht,cCount);
                        if (start_Idx<=0){
                            //错误格式
                            res.statusCode = 400;
                            res.json({success:false, messag: '表头不匹配'});
                        }else{
                            var http_code = 200;
                            var http_msg = '上传成功';
                            var success = true;
                            //正确格式
                            for(var rIdx = start_Idx; rIdx < rCount; rIdx++){	// rIdx：行数；cIdx：列数
                                var data = [];
                                try{
                                    //console.log('  cell : row = %d, col = %d, value = "%s"', rIdx, cIdx, sht.cell(rIdx,cIdx));
                                    insertDatas(req,sht,rIdx);//插入数据库
                                    build_certimage(req,sht,rIdx);//生成图片
                                }catch(e){
                                    console.log(e.message);
                                    http_code = 400;
                                    http_msg = '内容错误';
                                    success = false;
                                    break;
                                }
                            }
                            res.statusCode = http_code;
                            res.json({success:success, messag: http_msg});
                        }
                    }
                }
            });
        }
    });
});

module.exports = router;