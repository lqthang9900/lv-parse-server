Parse.Cloud.useMasterKey();
var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    tools = require('./tools');
    errorConfig = require('../config/error-config')

Parse.Cloud.define('getShopInfo',function(req,res) {
    var shopId = req.params.shopId || 'SVGHiY4qfA';
    if(!req.user){
        tools.notLogin(req,res);
    }
    if(!shopId) {
        tools.error(req,res,'undefine shop id',errorConfig.REQUIRE);
        return;
    }
    var query = new Parse.Query('Shop');
    query.notContainedIn('status',['block','delete']);
    query.include('shop_owner');
    query.get(shopId)
    .then(function (shop) {
        if (shop){
            tools.success(req,res,'get user info success',shop);
        }
        else {
            tools.error(req,res,'shop not found',errorConfig.NOT_FOUND);
        }
    }).catch(function (err) {
        console.log('-getShopInfo');
        tools.error(req,res,'error get shop info catch', err, errorConfig.ACTION_FAIL.code);
    })
})

Parse.Cloud.define('createShop',function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
    }
    var shopName = req.params.shopName;
    var address = req.params.address;
    var phoneNumber = req.params.phoneNumber;
    var description = req.params.description;
    var user = req.user;
    if(!shopName || !address || !phoneNumber) {
        tools.error(req,res,'some property undefine',errorConfig.REQUIRE);
        return;
    }
    else {
        checkShopExists(shopName)
        .then(function(shop){
            if(shop) {
                tools.error(req,res,'shop name exists', errorConfig.EXIST);
            }
            else {
                var Shop = Parse.Object.extend("Shop");
                var shop = new Shop();
                shop.set('shop_name', shopName);
                shop.set('shop_phone_number', phoneNumber);
                shop.set('shop_address', address),
                shop.set('shop_owner',user);
                if(description) shop.set('shop_description', description);
                shop.save(null,{
                    success: function(shop) {
                        tools.success(req,res,'create shop success',shop);
                    },
                    error: function(gameScore, error) {
                        tools.error(req,res,'create shop fail', error,errorConfig.ACTION_FAIL.code);
                    }
                })
            }
        })
        .catch(function(err){
             tools.error(req,res,'error check shop exist', err,errorConfig.ACTION_FAIL.code);
        })
    }  
})

function checkShopExists(shopName) {
    return new Promise(function (resolve, reject) {
        if(!shopName) {
            resolve();
            return;
        }
        var query = new Parse.Query('Shop');
        query.equalTo('shop_name', shopName);
        query.notEqualTo('status','delete');
        query.first()
        .then(function (shop) {
            if (shop) resolve(shop);
            else resolve();
        }).catch(function (err) {
            console.log('-checkUserExists');
            reject();
        })
    })
}
