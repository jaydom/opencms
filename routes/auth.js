/**
 * Created by chenqianfeng on 2017/6/15.
 */
exports.isValid = function (req, res, next) {
    //user had login?
    console.log(req.headers['authorization'])
    if (typeof (req.headers['authorization']) == 'undefined'){
        var err = new Error('Forbid');
        err.status = 403;
        next(err);
    }else{
        req.models.User.find(function(err, users){
            if(err){
                //res.send(err);
                console.log(err)
            }else{
                console.log(JSON.stringify(users))
            }
            next();
            //res.send(JSON.stringify(users));
        });
    }
}
