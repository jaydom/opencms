var express = require('express');
var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', function(req, res, next) {
    console.log(req.body);
    req.models.User.find({name:req.body.email,password:req.body.password}).run(function(err, users){
        if(err){
            //res.send(err);
            console.log(err)
            res.json({ account: req.body.email});
        }else{
            if (users.length<=0){
                res.json({ account: req.body.email});
            }else{
                res.json({ account:req.body.email,token:'abcdbe' });
            }
        }
        //res.send(JSON.stringify(users));
    });
});

module.exports = router;
