var xl = require('node-xlrd');
var base = require("./Base");
var stately = require("stately.js");
var moment = require('moment');
var exec = require('child_process').exec;

var table_header = [
    {"title":"序号","name":"sort_id","insert":false},
    {"title":"姓名","name":"name","insert":true},
    {"title":"性别","name":"sex","insert":true},
    {"title":"民族","name":"nation","insert":true},
    {"title":"出生年月","name":"birth_date","insert":true},
    {"title":"身份证号码","name":"idcard","insert":true},
    {"title":"联系电话","name":"telno","insert":true},
    {"title":"E-mail","name":"email","insert":true},
    {"title":"省市","name":"city","insert":true},
    {"title":"居住地址","name":"address","insert":true},
    {"title":"报考项目","name":"exam_type","insert":true},
    {"title":"报考等级","name":"exam_level","insert":true},
];

exports.parse = function (req,sht,cb) {
    var rCount = sht.row.count;
    var club =  sht.cell(1,2);
    var leader = sht.cell(2,1);
    var leader_telno = sht.cell(2,3);
    var coach = sht.cell(2,6);
    var coach_telno = sht.cell(2,8);
    if(typeof club =='undefined'||typeof leader =='undefined'||typeof leader_telno =='undefined'||typeof coach =='undefined'||typeof coach_telno =='undefined'){
        console.log(club);
        console.log(leader);
        console.log(leader_telno);
        console.log(coach);
        console.log(coach_telno);
        cb("表格头部错误");
    }else if(base.isValidFormat(sht,3,table_header)<0){
        cb("表格格式错误");
    }else {
        var club =  sht.cell(1,2).toString().trim();
        var leader = sht.cell(2,1).toString().trim();
        var leader_telno = sht.cell(2,3).toString().trim();
        var coach = sht.cell(2,6).toString().trim();
        var coach_telno = sht.cell(2,8).toString().trim();
        req.models["Club"].find({name:club}).first(function(err, club_data){
            if(err){
                console.log("[error club]"+err);
                cb("数据库错误Club");
            }else if(club_data==null){
                cb("所属协会未登记:"+club);
            }else{
                req.models["Leader"].find({name:leader,telno:leader_telno}).first(function(err, leader_data){
                    if(err){
                        console.log("[error Leader]"+err);
                        cb("数据库错误Leader");
                    }else if(leader_data==null){
                        cb("领队未登记:"+leader);
                    }else{
                        console.log(typeof coach);
                        console.log(coach);
                        console.log(typeof coach_telno);
                        console.log(coach_telno);
                        req.models["Coach"].find({name:coach,telno:coach_telno}).first(function(err, coach_data){
                            if(err){
                                console.log("[error Coach]"+err);
                                cb("数据库错误Coach");
                            }else if(coach_data==null){
                                cb("教练未登记:"+coach);
                            }else{
                                var err = null;
                                var datas = [];
                                console.log(club_data);
                                console.log(leader_data);
                                console.log(coach_data);
                                for(var rIdx = 4; rIdx < rCount; rIdx++){	// rIdx：行数；cIdx：列数
                                    try{
                                        var cols = base.parse_cols(sht,rIdx,table_header);
                                        if(base.isValidCols(cols)){
                                            cols["club"] = club_data["name"];
                                            cols["club_id"] = club_data["id"];
                                            cols["leader"] = leader_data["name"];
                                            cols["leader_id"] = leader_data["id"];
                                            cols["coach"] = coach_data["name"];
                                            cols["coach_id"] = coach_data["id"];
                                            datas.push(cols);
                                        }
                                    }catch(e){
                                        err = "内容错误";
                                        break;
                                    }
                                }
                                cb(err,datas);
                            }
                        });
                    }
                });
            }
        });
    }
}
