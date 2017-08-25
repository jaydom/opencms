var express = require('express');
var router = express.Router();


/* GET users listing. */
router.post('/', function(req, res, next) {
    var conditions = req.body["conditions"];
    var results = {"err":null,datas:[]};
    //执行查询
    req.models.Certificate.find(conditions).first(function(err, datas){
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


router.get('/result', function(req, res, next) {
    console.log(req.query.user_name);
    console.log(req.query.user_idcard);
    req.models.Certificate.find({ player_name: req.query.user_name }).run(function(err, users){
        if(err){
            //res.send(err);
            console.log(err)
        }else{
            if (users.length>0){
                var image = users[0].cert_id + ".jpg"
                res.render('cert-result', { title: '考证结果',result:"考证通过" ,images:image});
            }else{
                res.render('cert-result', { title: '考证结果',result:"考证未通过" ,images:"comeon.jpg"});
            }
            console.log(JSON.stringify(users))
        }

        //res.send(JSON.stringify(users));
    });
    //res.send('respond with a resource')
});

module.exports = router;
