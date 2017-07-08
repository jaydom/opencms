var express = require('express');
var router = express.Router();


/* GET users listing. */
router.get('/cert', function(req, res, next) {
    req.models.Certificate.find(function(err, users){
        if(err){
            //res.send(err);
            console.log(err)
            res.json([])
        }else{
            console.log(JSON.stringify(users))
            res.json(users)
        }

        //res.send(JSON.stringify(users));
    });
});

router.delete('/cert/:id', function(req, res, next) {
    req.models.Certificate.find({id:req.params.id}).first(function(err, data){
        if(err){
            //res.send(err);
            console.log(err)
            res.statusCode = 500;
            res.json({success:false, messag: err});
        }else{
            console.log(data)
            console.log(JSON.stringify(data, null, 2));
            data.remove(function (err) {
                if(err){
                    res.statusCode = 403;
                    res.json({success:false, messag: err});
                }else{
                    res.statusCode = 200;
                    res.json({success:true, messag: "remove success"});
                }
            });
        }
    });
});

router.post('/cert', function(req, res, next) {
    req.models.Certificate.find({id:req.body.id}).first(function(err, data){
        var attrs = ["id","player_name","exam_type","exam_time","exam_area","exam_address","cert_time","sex","tel","cert_id","idcard","exam_type","exam_level"];
        if(err){
            //res.send(err);
            console.log(err)
            res.statusCode = 500;
            res.json({success:false, messag: err});
        }else{
            for (var i in attrs){
                var name = attrs[i]
                data[name] = req.body[name];
            }
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

router.get('/cert/:id', function(req, res, next) {
    console.log(req.params.id);
    req.models.Certificate.find({id:req.params.id}).run(function(err, users){
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

module.exports = router;
