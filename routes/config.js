var rf=require("fs");
var orm = require("orm");

//reading config
console.log("===================================");
console.log("parse db json");
var config = {
    "db_conf": {},
    "table_conf":{}

};
//读文件
config["db_conf"] = JSON.parse(rf.readFileSync("public/server/db/db.json","utf-8"));
for(var key in config["db_conf"]["tables"]) {
    var table_conf = config["db_conf"]["tables"][key];
    var table_name = table_conf["name"];
    var table_json = table_name+".json";
    console.log("parse "+table_name+" json");
    config["table_conf"][table_name]= JSON.parse(rf.readFileSync("public/server/db/"+table_json,"utf-8"));
    config["table_conf"][table_name]["table"] = table_conf["table"];
}
//提取配置
var db_tables_attrs = {};
var db_table_conf = {}
for (var key in config["table_conf"]){
    var table_conf = config["table_conf"][key];
    db_tables_attrs[key] = {"attrs":[]}; //表格属性
    db_table_conf[key] = {"table":table_conf["table"],"cols":{}};//提供orm使用
    for(var i in table_conf["db_cols"]){
        var attr = table_conf["db_cols"][i]["field"];
        var type = table_conf["db_cols"][i]["type"];
        //提取属性
        db_tables_attrs[key]["attrs"].push(attr);
        //提取orm属性
        if(type.toLowerCase()=="number"){
            db_table_conf[key]["cols"][attr] = Number;
        }else if(type.toLowerCase()=="string"){
            db_table_conf[key]["cols"][attr] = String;
        }else if(type.toLowerCase()=="date"){
            db_table_conf[key]["cols"][attr] = Date;
        }else if(type.toLowerCase()=="serial"){
            db_table_conf[key]["cols"][attr] = "serial";
        }else if(type.toLowerCase()=="ignore" ){
            //ignore
        } else{
            console.log("[error]unknown type:"+ type);
            db_table_conf[key]["cols"][attr] = String;
        }
    }
}
console.log("===================================");

exports.get_table_attrs = function(){
    return db_tables_attrs;
}

exports.get_db_conf = function(){
    return db_table_conf;
}