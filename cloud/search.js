Parse.Cloud.useMasterKey();
var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    tools = require('./tools');
    errorConfig = require('../config/error-config')
Parse.Cloud.define('searchSuggestion',function(req,res) {
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var keyword = req.params.keyword;
    if(!(keyword && keyword.trim())) {
         tools.error(req,res,'keyword was not empty or undefine',errorConfig.REQUIRE);
    }
    var query = new Parse.Query('Product');
    query.notContainedIn('status',['delete','block']);
    query.contains('product_name', keyword);
    query.find()
    .then(function(results) {
         tools.success(req, res, 'search product success', results);
    })
    .catch(function(err) {
        tools.error(req,res, 'search product fail', errorConfig.ACTION_FAIL, err);
    })
})

Parse.Cloud.define('searchWithProductName',function(req,res) {
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
      var keyword = req.params.keyword;
    var limit = req.params.limit;
    var page = req.params.page;
    if(!limit || !page) {
        tools.error(req,res, 'params was not undefine', errorConfig.REQUIRE);
        return;
    }
    else {
        limit = parseInt(limit);
        page = parseInt(page);
        if(page < 1) {
            tools.error(req,res, 'page must be larger than 0', errorConfig.ERROR_PARAMS);
            return;
        }
    }
    if(!(keyword && keyword.trim())) {
         tools.error(req,res,'keyword was not empty or undefine',errorConfig.REQUIRE);
    }
    var query = new Parse.Query('Product');
    query.notContainedIn('status',['delete','block']);
    query.contains('product_name', keyword);
    query.find()
    .then(function(results) {
        var arrPromise = [];
        for(var i =0 ; i < results.length ; i++) {
            var product = new Parse.Object('Product');
            product.id = results[i].id;
            var productDetailQuery = new Parse.Query('ProductDetail');
            // productDetailQuery.limit(limit+1); // increase 1 to cehck have more product
            // productDetailQuery.skip((page-1)*limit);
            productDetailQuery.equalTo('product',product);
            productDetailQuery.include('product');
            productDetailQuery.include('promotion');
            productDetailQuery.notContainedIn('status',['delete','block']);
            arrPromise.push(productDetailQuery.find())
        }
        Promise.all(arrPromise)
        .then(function(results) {
            var flatResults = [];
            for(var i = 0 ; i < results.length ; i++) {
                for(var   j = 0 ; j < results[i].length; j++) {
                    flatResults.push(results[i][j]);
                }
            }
            var result = flatResults.slice((page-1)*limit, (page-1)*limit + limit+1);
            if(result.length > limit) { // if results.length  > limit => have more product => last = false else last = true
                result.pop();
                tools.success(req, res, 'get product list success', result);
            } 
            else {  
                var last = true;
                tools.success(req, res, 'get product list success', result,last);
            }
            console.log("aa");
        })
        .catch(function(err){
            console.log(err);
        })
        //  tools.success(req, res, 'search product success', results);
    })
    .catch(function(err) {
        tools.error(req,res, 'search product fail', errorConfig.ACTION_FAIL, err);
    })
})