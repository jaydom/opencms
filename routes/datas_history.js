var express = require('express');
var router = express.Router();
var orm = require("orm");
var auth = require('./auth');
var config = require("./config");
var moment = require("moment");
//reading config
var db_tables = config.get_table_attrs();

router.all('/', auth.isValid);

router.all('/:table_name', function(req, res, next){
    var table_name = req.params["table_name"];
    if(!db_tables.hasOwnProperty(table_name)){
        var err = new Error('not found');
        err.status = 404;
        console.log(table_name+"not in db_tables");
        next(err);
    }else{
        next();
    }
});

router.get('/:table_name/all', function(req, res, next) {
    var table_name = req.params["table_name"];
    var conditions = {};
    console.log(req.query);
    if (typeof req.query["filter"]!="undefined"){
        var name = req.query["filter"]["name"];
        var op = req.query["filter"]["op"];
        var value = req.query["filter"]["value"];
        if(op=="like" ){
            conditions[name] = orm.like("%"+ value + "%");
        }else{
            conditions[name] = value;
        }
    }
    console.log(conditions)
    var results = {"err":null,datas:[]};
    //执行查询
    req.models[table_name].find(conditions).order('-sort_id').all(function(err, datas){
        if(err){
            //res.send(err);
            console.log(err);
            results["err"] = err;
            res.json(results);
        }else{
            console.log(datas);
            results["datas"] = datas;
            res.json(results);
        }
    });
});

/* GET users listing. */
router.get('/:table_name', function(req, res, next) {
    var table_name = req.params["table_name"];
    //查询结果
    var result = {count:0,results:[]};
    //分页
    var count = parseInt(req.query.count);
    var offset = parseInt((req.query.page-1)*count);
    //排序
    var sort_key = "sort_id";
    var sort_type = "asc";
    if (typeof req.query["sorting"]!="undefined"){
        for (var key in req.query.sorting) {
            sort_key = key;
            sort_type = req.query.sorting[key];
        }
    }
    if(sort_type=="desc"){
        sort_key = "-" + sort_key;
    }
    //查询条件
    var conditions = { };

    if (typeof req.query["filter"]!="undefined"){
        var name = req.query["filter"]["name"];
        var op = req.query["filter"]["op"];
        var value = req.query["filter"]["value"];
        if(op=="like" ){
            conditions[name] = orm.like("%"+ value + "%");
        }else{
            conditions[name] = value;
        }
    }
    //执行查询
    req.models[table_name].find(conditions).count(function (err, data_count) {
        // people = number of people with surname="Doe"
        if(err){
            //res.send(err);
            console.log(err);
            res.json(result);
        }else{
            req.models[table_name].find(conditions).limit(count).offset(offset).order(sort_key).run(function(err, datas){
                if(err){
                    //res.send(err);
                    console.log(err);
                    res.json(result);
                }else{
                    console.log(JSON.stringify(datas));
                    result["count"] = data_count;
                    result["results"] = datas;
                    res.json(result);
                }
            });
        }
    });
});

router.delete('/:table_name/:id', function(req, res, next) {
    var table_name = req.params["table_name"];
    req.models[table_name].find({id:req.params.id}).first(function(err, data){
        if(err){
            //res.send(err);
            console.log(err)
            res.statusCode = 500;
            res.json({success:false, messag: err});
        }else{
            data.remove(function (err) {
                if(err){
                    res.statusCode = 400;
                    res.json({success:false, messag: err});
                }else{
                    res.statusCode = 200;
                    res.json({success:true, messag: "remove success"});
                }
            });
        }
    });
});

router.post('/:table_name/delete_all', function(req, res, next) {
    var table_name = req.params["table_name"];
    var condition = {};
    console.log(req.body);
    if(req.body["dataset"].length>0){
        if (req.body["type"]=="delete"){
            condition = {
                "id": req.body["dataset"]
            }
        }else{
            condition = {
                "id": orm.not_in(req.body["dataset"])
            }
        }
    }
    console.log(condition);
    req.models[table_name].find(condition).remove(function(err){
        if(err){
            res.statusCode = 400;
            res.json({success:false, messag: err});
        }else{
            res.statusCode = 200;
            res.json({success:true, messag: "remove success"});
        }
    });
});

router.post('/:table_name', function(req, res, next) {
    var now = new Date().toLocaleString();
    var table_name = req.params["table_name"];
    req.models[table_name].find({id:req.body.id}).first(function(err, data){
        var attrs = db_tables[table_name]["attrs"];
        if(err){
            //res.send(err);
            console.log(err)
            res.statusCode = 500;
            res.json({success:false, messag: err});
        }else{
            for (var i in attrs){
                var name = attrs[i];
                if (name!="create_date"&&name!="update_date"){
                    console.log(name);
                    data[name] = req.body[name];
                }
            }
            //添加更新日期
            data["update_date"] = now;
            console.log(data)
            console.log(JSON.stringify(data, null, 2));
            data.save(function (err) {
                if(err){
                    res.statusCode = 403;
                    res.json({success:false, messag: err});
                }else{
                    res.statusCode = 200;
                    res.json({success:true, messag: "update success"});
                }
            });
        }
    });
});

router.put('/:table_name', function(req, res, next) {
    var now = new Date().toLocaleString();
    var table_name = req.params["table_name"];
    for(var i in req.body){
        req.body[i]["create_date"] = now;
    }
    req.models[table_name].create(req.body, function (err, items) {
        // err - description of the error or null
        // items - array of inserted items
        if(err){
            //res.send(err);
            console.log(err)
            res.statusCode = 400;
            res.json({success:false, messag: err});
        }else{
            res.statusCode = 200;
            res.json({success:true, messag: "update success"});
        }
    });
});

router.get('/:table_name/:id', function(req, res, next) {
    var table_name = req.params["table_name"];
    console.log(req.params.id);
    req.models[table_name].find({id:req.params.id}).run(function(err, users){
        if(err){
            //res.send(err);
            console.log(err);
            res.json([]);
        }else{
            console.log(JSON.stringify(users, null, 2));
            res.json(users);
        }
        //res.send(JSON.stringify(users));
    });
});


router.get('/result', function(req, res, next) {
    console.log(req.query.user_name);
    console.log(req.query.user_idcard);
    req.models.Certificate.find({ player_name: req.query.user_name }).run(function(err, users){
        if(err){
            //res.send(err);
            console.log(err)
        }else{
            if (users.length>0){
                res.render('cert-result', { title: '考证结果',result:"考证通过" ,images:"test.jpg"});
            }else{
                res.render('cert-result', { title: '考证结果',result:"考证未通过" ,images:"comeon.jpg"});
            }
            console.log(JSON.stringify(users))
        }

        //res.send(JSON.stringify(users));
    });
    //res.send('respond with a resource')
});


router.put('/:table_name/group/:map_table_name', function(req, res, next) {
    var now = new Date().toLocaleString();
    var table_name = req.params["table_name"];
    var map_table_name = req.params["map_table_name"];
    var map_table = req.body[0]["foreign_array"];
    console.log(table_name);
    console.log(req.body);
    for(var i in req.body){
        req.body[i]["create_date"] = now;
    }
    req.models[table_name].create(req.body, function (err, items) {
        // err - description of the error or null
        // items - array of inserted items
        if(err){
            //res.send(err);
            console.log(err)
            res.statusCode = 400;
            res.json({success:false, messag: err});
        }else{
            var item = items[0];
            var map_table_items = [];
            for(var i in map_table){
                console.log(map_table[i]["id"]);
                console.log(map_table[i]["name"]);
                var data = {
                    "name":"",
                    "create_date": now,
                    "referee_id":map_table[i]["id"],
                    "referee_name":map_table[i]["name"],
                    "referee_group_id":item["id"],
                    "referee_group_name":item["name"],
                }
                map_table_items.push(data)
            }
            console.log(map_table_items);
            req.models[map_table_name].create(map_table_items, function (err, items) {
                if(err){
                    //res.send(err);
                    console.log(err)
                    res.statusCode = 400;
                    res.json({success:false, messag: err});
                }else{
                    res.statusCode = 200;
                    res.json({success:true, messag: "update success"});
                }
            });
        }
    });
});


router.post('/:table_name/group/:map_table_name', function(req, res, next) {
    var now = new Date().toLocaleString();
    var table_name = req.params["table_name"];
    var map_table_name = req.params["map_table_name"];
    var map_table = req.body["foreign_array"];
    //1.删除旧关联
    //2.建立新关联
    req.models[table_name].find({id:req.body.id}).first(function(err, data){
        var attrs = db_tables[table_name]["attrs"];
        if(err){
            //res.send(err);
            console.log(err)
            res.statusCode = 500;
            res.json({success:false, messag: err});
        }else{
            for (var i in attrs){
                var name = attrs[i];
                if (name!="create_date"&&name!="update_date"){
                    console.log(name);
                    data[name] = req.body[name];
                }
            }
            //添加更新日期
            data["update_date"] = now;
            console.log(data)
            console.log(JSON.stringify(data, null, 2));
            data.save(function (err) {
                if(err){
                    res.statusCode = 403;
                    res.json({success:false, messag: err});
                }else{
                    req.models[map_table_name].find({referee_group_id:req.body.id}).remove(function(err){
                        if(err){
                            res.statusCode = 400;
                            res.json({success:false, messag: err});
                        }else{
                            var item = req.body;
                            var map_table_items = [];
                            for(var i in map_table){
                                console.log(map_table[i]["id"]);
                                console.log(map_table[i]["name"]);
                                var data = {
                                    "name":"",
                                    "create_date": now,
                                    "referee_id":map_table[i]["id"],
                                    "referee_name":map_table[i]["name"],
                                    "referee_group_id":item["id"],
                                    "referee_group_name":item["name"],
                                }
                                map_table_items.push(data)
                            }
                            console.log(map_table_items);
                            req.models[map_table_name].create(map_table_items, function (err, items) {
                                if(err){
                                    //res.send(err);
                                    console.log(err)
                                    res.statusCode = 400;
                                    res.json({success:false, messag: err});
                                }else{
                                    res.statusCode = 200;
                                    res.json({success:true, messag: "update success"});
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

router.delete('/:table_name/group/:map_table_name/:id', function(req, res, next) {
    var table_name = req.params["table_name"];
    var map_table_name = req.params["map_table_name"];
    var condition = {"referee_group_id":req.params.id};
    req.models[map_table_name].find(condition).remove(function(err){
        if(err){
            res.statusCode = 400;
            res.json({success:false, messag: err});
        }else{
            req.models[table_name].find({id:req.params.id}).first(function(err, data){
                if(err){
                    //res.send(err);
                    res.statusCode = 500;
                    res.json({success:false, messag: err});
                }else{
                    data.remove(function (err) {
                        if(err){
                            res.statusCode = 400;
                            res.json({success:false, messag: err});
                        }else{
                            res.statusCode = 200;
                            res.json({success:true, messag: "remove success"});
                        }
                    });
                }
            });
        }
    });
});


router.post('/:table_name/group/:map_table_name/delete_all', function(req, res, next) {
    console.log("delete all group")
    var table_name = req.params["table_name"];
    var map_table_name = req.params["map_table_name"];
    var condition = {};
    var condition_map_data = {};
    if(req.body["dataset"].length>0){
        if (req.body["type"]=="delete"){
            condition = {
                "id": req.body["dataset"]
            }
            condition_map_data = {
                "referee_group_id": req.body["dataset"]
            }
        }else{
            condition = {
                "id": orm.not_in(req.body["dataset"])
            }
            condition_map_data = {
                "referee_group_id": orm.not_in(req.body["dataset"])
            }
        }
    }
    req.models[map_table_name].find(condition_map_data).remove(function(err){
        if(err){
            res.statusCode = 400;
            res.json({success:false, messag: err});
        }else{
            req.models[table_name].find(condition).remove(function(err){
                if(err){
                    res.statusCode = 400;
                    res.json({success:false, messag: err});
                }else{
                    res.statusCode = 200;
                    res.json({success:true, messag: "remove success"});
                }
            });
        }
    });

});

module.exports = router;
