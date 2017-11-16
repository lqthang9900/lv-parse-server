Parse.Cloud.useMasterKey();

var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    errorConfig = require('../config/error-config')
    tools = require('./tools');
var zeroCode = '0';
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
}); 
var successSendRequest = { 'code': 200, 'message': 'send mail successful' },
    successResetPass = { 'code': 200, "message": 'reset pass successful' };

var errorInsideManyUser = { code: 400, 'message': 'email inside many user' },
    errorUserNotFound = { code: 404, message: 'email not found' };

var generateCodeNotCorrect = { code: 401, 'message': 'generatecode is not correct' },
    expiredDateNotCorrect = { code: 401, 'message': 'expireddate  is expired' };

var mailHost = 'smtp.gmail.com',
    mailPort = 465,
    mailUser = 'luanvanmailer@gmail.com',
    mailPass = 'abc12345678',
    mailFrom = '"LV Admin" <luanvanmailer@gmail.com>',
    mailSubject = '[LuanVan] Verify code',
    mailText = 'Your code confirm reset password: ';

var sendMail = function(email, code, date) {
    return new Promise(function(resolve, reject) {
        var smtpConfig = {
            host: mailHost,
            port: mailPort,
            secure: true,
            auth: {
                user: mailUser,
                pass: mailPass
            }
        };
        var transporter = mailer.createTransport(smtpConfig);
        var mailOptions = {
            from: mailFrom,
            to: email,
            subject: mailSubject,
            text: mailText + code
        };
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                return console.log(error);
                reject(error);
            }
            var query = new Parse.Query(Parse.User);
            query.equalTo("email", email);
            query.notContainedIn('status', ['delete','block']);
            query.find().then(function(result) {
                if (result.length === 1) {
                    var result = result[0];
                    result.set("generatecode", code);
                    result.set("expireddate", date);
                    result.save(null,{ useMasterKey: true }).then(function(results) {
                        console.log(results);
                        resolve(successSendRequest);
                    }).catch(function(error) {
                        console.log('-sendMail');
                        reject(error);
                    })
                } else {
                    reject(errorInsideManyUser);
                }
            }).catch(function(error) {
                console.log('-sendMail');
                reject(error);
            });
        });
    });
};
Parse.Cloud.define("requestPassword", function(req, res) {
    var username = req.params.username;
    var code = utils.randomValueHex(6);
    var date = new Date(moment().utc().toDate().getTime() + 86400000);
    var  query = new Parse.Query(Parse.User);
    query.equalTo("username", username);
    query.notContainedIn('status', ['delete','block']);
    query.find({useMasterKey : true}).then(function(result) {
        if (result.length === 1) {
            sendMail(result[0].get('email'), code, date).then(function(result) {
                tools.success(req,res,'send mail success',result);
            }).catch((error) => {
                console.log('-requestpassword');
                tools.error(req,res,'send mail fail', errorConfig.ACTION_FAIL,error);
            });
        } else if (result.length === 0) {
            tools.error(req,res,'username not found',errorConfig.NOT_FOUND);
        } else {
            tools.error(req,res,'username inside many user',errorConfig.INSIDE_MANY);
        }
    }).catch(function(error) {
        console.log('-requestpassword');
         tools.error(req,res,'requestpassword catch',  errorConfig.ACTION_FAIL ,error);
    });
});
Parse.Cloud.define("resetPassword", function(req, res) {
    var username = req.params.username;
    var password = req.params.password;
    var code = req.params.verifyCode;
    var query = new Parse.Query(Parse.User);
    query.equalTo("username", username);
    query.notContainedIn('status',['delete','block']);
    query.find()
    .then(function(result) {
        if (result.length === 1) {
            result = result[0];
            if (result.get("expireddate").toISOString() > moment().utc().toDate().toISOString() && result.get("generatecode") === code) {
                result.set('password', password);
                result.set('generatecode', zeroCode);
                return result.save(null,{ useMasterKey: true })
            } else {
                if (result.get("expireddate").toISOString() < moment().utc().toDate().toISOString()) {
                    tools.error(req,res,'expireddate  is expired',errorConfig.ACTION_FAIL);
                } else if (result.get("generatecode") != code) {
                    tools.error(req,res,'generatecode is not correct',errorConfig.ACTION_FAIL);
                }
            }
        } else if (result.length === 0) {
            tools.error(req,res,'email not found',errorConfig.NOT_FOUND);
        } else {
            tools.error(req,res,'email inside many user',errorConfig.INSIDE_MANY);
        }
    })
    .then(function(result) {
        console.log(result);
        res.success(successResetPass);
         tools.success(req, res, 'reset password success', result);
    }).catch(function(error) {
        console.log('-resetpassword');
        tools.error(req, res, 'reset password faild', errorConfig.ACTION_FAIL, error);
    });
});
Parse.Cloud.define('changePassword', function(req, res) {
    var userName = req.params['username'];
    var oldPassword = req.params['oldPassword'];
    var newPassword = req.params['newPassword'];
    if (!req.user) {
        res.error({
            code: 103,
            message: 'Cannot oauth.'
        });
        return;
    }
    Parse.User.logIn(userName, oldPassword).then(function(user) {
        if (user) {
            if (user.id == req.user.id) {
                if(user.get("status") != 'delete' && user.get("status") != 'block') {
                    user.set('password', newPassword);
                    user.save(null, { useMasterKey: true }).then(function(user) {
                        res.success({
                            success: true
                        })
                    }).catch(function(err) {
                        console.log('-changePassword');
                        res.error({
                            code: 102,
                            message: 'Cannot save new password.'
                        })
                    })
                }
                else {
                    res.error(errorConfig.NOT_FOUND);
                }
            } else {
                res.error({
                    code: 103,
                    message: 'Cannot oauth. User check error.'
                });
            }
        } else {
            res.error({
                code: 101,
                message: 'Old password is invalid.'
            })
        }
    }).catch(function() {
        console.log('-changePassword');
        res.error({
            code: 101,
            message: 'Old password is invalid.'
        })
    })
});
Parse.Cloud.define('editProfile', function (req, res) {
    if (!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var userParams = req.user;
    var userInfo = req.params.userInfo;
    var response = {};
    userParams.fetch()
    .then(function (user) {
        return checkEmailExists(userInfo.email);
    })
    .then(function(userExists) {
        if(userExists) {
            if(userExists.id == userParams.id){
                return checkUserHasShop(userParams);
            }
            else{
                  tools.error(req,res,'email has been used',errorConfig.EXIST);
            }
        }
        else {
           return checkUserHasShop(userParams);
        }
    })
    .then(function(shop){ 
        if(shop) {
            response.shop = shop;
        }
        if(userInfo.avatar) {
            var file = new Parse.File('avatar.png', { base64: userInfo.avatar });
            userInfo.avatar = file;
        }
        for (var i in userInfo) {
            userParams.set(i, userInfo[i]);
        }
        return userParams.save(null,{ useMasterKey: true })
    })
    .then(function(userSave){
        userSave = tools.cloneUserInfo(userSave, ['username','first_name','last_name','email','phone_number', 'gender'])
        response.user = userSave;
        tools.success(req, res, 'edit user success', response);
    })
    .catch(function (err) {
        console.log('-editProfile');
        tools.error(req, res, 'editProfile error', errorConfig.ACTION_FAIL,err);
    })
});
Parse.Cloud.define("signUp", function(req,res) {
    var user = new Parse.User();
    var username = req.params.username;
    var firstName = req.params.first_name;
    var lastName = req.params.last_name;
    var password = req.params.password;
    if(!username || !firstName || !lastName || !password) {
        tools.error(req,res,'params is undefine',{});
        return;
    }
    else {
        checkUserExists(username)
        .then(function(userExists){
            if(userExists) {
                tools.error(req,res,'username is exists',errorConfig.EXIST)
            }
            else { 
                user.set("username",username);
                user.set("first_name",firstName);
                user.set("last_name",lastName);
                user.set("password",password);
                user.signUp(null, {
                success: function(userResponse) {
                    // Hooray! Let them use the app now.
                    tools.success(req,res,'signup success', userResponse);
                },
                error: function(user, error) {
                    // Show the error message somewhere and let the user try again.
                    tools.error(req,res,'error in signup', errorConfig.ACTION_FAIL,error)
                }
                }); 
            }
        })
        .catch(function(err){
            tools.error(req,res,'check username exist fail', errorConfig.ACTION_FAIL,err)
        })
    }
})
Parse.Cloud.define("getUserInfo", function(req,res){
   var userId = req.params.userId;
   if(!userId){
       tools.error(req,res,'user not found',{});
   }
   var userQuery = new Parse.Query(Parse.User);
   userQuery.notEqualTo('status', 'delete');
   userQuery.get(userId, { useMasterKey: true })
   .then(function (user) {
        if(user) {
            var userInfo = tools.cloneUserInfo(user,['username','first_name','last_name','email','phone_number','user_type','address'])
            checkUserHasShop(user)
            .then(function(shop){
                if(shop) {
                    tools.success(req,res,'get user info success',{
                        user : userInfo,
                        shop : shop
                    });
                }
                else {
                     tools.success(req,res,'get user info success',userInfo);
                }
            })
            .catch(function(error){
                tools.error(req,res,'error check user has shop' ,errorConfig.ACTION_FAIL, error);
            })
        }
        else {
             tools.error(req,res,'user not found', errorConfig.NOT_FOUND);
        } 
    })
   .catch(function(error){
        tools.error(req,res,'error get user info fail', errorConfig.ACTION_FAIL,error);
   })
})

function checkEmailExists(email) {
    return new Promise(function (resolve, reject) {
        if(!email) {
            resolve();
            return;
        }
        var query = new Parse.Query('User');
        query.equalTo('email', email);
        query.notEqualTo('status', 'delete');
        query.first().then(function (user) {
            if (user) resolve(user);
            else resolve(null);
        }).catch(function (err) {
            console.log('-checkEmailExists');
            reject();
        })
    })
}
function checkUserExists(username) {
    return new Promise(function (resolve, reject) {
        if(!username) {
            resolve();
            return;
        }
        var query = new Parse.Query('User');
        query.equalTo('username', username);
        query.first().then(function (user) {
            if (user) resolve(user);
            else resolve();
        }).catch(function (err) {
            console.log('-checkUserExists');
            reject();
        })
    })
}
function checkUserHasShop(user) {
    return new Promise(function (resolve, reject) {
        var query = new Parse.Query('Shop');
        query.equalTo('shop_owner', user);
        query.notEqualTo('status', 'delete');
        query.first().then(function (shop) {
            if (shop) resolve(shop);
            else resolve(null);
        }).catch(function (err) {
            console.log('-checkShopExists');
            reject();
        })
    })
}