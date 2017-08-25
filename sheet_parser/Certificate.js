var xl = require('node-xlrd');
var base = require("./Base");
var stately = require("stately.js");
var moment = require('moment');
var exec = require('child_process').exec;

var table_header = [
    {"title":"序号","name":"sort_id","insert":false},
    {"title":"颁证日期","name":"cert_time","insert":true},
    {"title":"证书编号","name":"cert_id","insert":true},
    {"title":"考试时间","name":"exam_time","insert":true},
    {"title":"考区","name":"exam_area","insert":true},
    {"title":"考场","name":"exam_address","insert":true},
    {"title":"报考项目","name":"exam_type","insert":true},
    {"title":"报考等级","name":"exam_level","insert":true},
    {"title":"姓名","name":"player_name","insert":true},
    {"title":"性别","name":"sex","insert":true},
    {"title":"身份证号码","name":"idcard","insert":true},
    {"title":"联系电话","name":"tel","insert":true},
    {"title":"所属培训单位","name":"club","insert":true}
];

function build_certimage(data,cb){
    var arg1 = data["exam_level"].toString().trim(); //level
    var arg2 = data["sex"].toString().trim(); //sex
    var arg3 = data["exam_area"].toString().trim(); //exam_area
    var arg4 = data["cert_id"].toString().trim(); //cert_id
    var arg5 = data["idcard"].toString().trim(); //IDCard_id
    var arg6 = moment(data["exam_time"]).format("YYYY-MM-DD"); //exam_time
    var arg7 = moment(data["cert_time"]).format("YYYY-MM-DD");//cert_time
    var arg8 = data["player_name"].toString().trim(); //player_name
    console.log('python image_builder/build_images.py '+ arg1+' '+arg2+' '+ arg3+' '+arg4+' '+arg5+' '+arg6+' '+arg7+' '+arg8);
    exec('python image_builder/build_images.py '+ arg1+' '+arg2+' '+ arg3+' '+arg4+' '+arg5+' '+arg6+' '+arg7+' '+arg8,cb);
}

exports.parse = function (req,sht,cb) {
    var rCount = sht.row.count;
    if(base.isValidFormat(sht,1,table_header)<0){
        cb("表格格式错误");
    }else {
        var err = null;
        var datas = [];
        for(var rIdx = 2; rIdx < rCount; rIdx++){	// rIdx：行数；cIdx：列数
            try{
                var cols = base.parse_cols(sht,rIdx,table_header);
                if(base.isValidCols(cols)){
                    cols["exam_time"] = moment(cols["exam_time"]).format("YYYY-MM-DD"); //exam_time
                    cols["cert_time"] = moment(cols["cert_time"]).format("YYYY-MM-DD");//cert_time
                    cols["cert_image"] = "/certs/"+cols["cert_id"]+".jpg";
                    cols["cert_image_md5"] = "";
                    datas.push(cols);
                    build_certimage(cols,function (err,stdout ,stderr ) {
                        if(err){
                            console.log(err);
                        }
                    });
                }
            }catch(e){
                err = "内容错误";
                break;
            }
        }
        cb(err,datas);
    }
}
