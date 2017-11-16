Parse.Cloud.useMasterKey();
var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    tools = require('./tools');
    errorConfig = require('../config/error-config')

Parse.Cloud.define('createProduct',function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
    }
    
})
Parse.Cloud.define('getProductListWithCategory',function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
    }
    var categoryId = req.params.categoryId;
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
    if(!categoryId) {
         tools.error(req,res, 'categoryId was not undefine', errorConfig.REQUIRE);
         return;
    }
    var category = new Parse.Object('Category');
    category.id = categoryId;
    var query = new Parse.Query('ProductDetail');
    query.equalTo('category',category);
    query.notContainedIn('status',['delete','block']);
    query.include('product');
    query.include('promotion');
    query.limit(limit);
    query.skip((page-1)*limit);
    query.find()
    .then(function(results){
        tools.success(req, res, 'get product list success', results);
    })
    .catch(function(err){
        tools.error(req, res, 'get product list fail', errorConfig.ACTION_FAIL, err);
    })
})

Parse.Cloud.define('getProductDetailWithId',function(req,res) { // == search with SKU
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var productId = req.params.id;
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
    if(!productId) {
        tools.error(req,res,'id was not undefine',errorConfig.REQUIRE);
    }
    var product = new Parse.Object('Product');
    product.id = productId;
    var productDetailQuery = new Parse.Query('ProductDetail');
    productDetailQuery.limit(limit+1); // increase 1 to cehck have more product
    productDetailQuery.skip((page-1)*limit);
    productDetailQuery.equalTo('product',product);
    productDetailQuery.include('product');
    productDetailQuery.include('promotion');
    productDetailQuery.notContainedIn('status',['delete','block']);
    productDetailQuery.find()
    .then(function(results){
        if(results.length > limit) { // if results.length  > limit => have more product => last = false else last = true
            results.pop();
            tools.success(req, res, 'get product list success', results);
        } 
        else {  
            var last = true;
            tools.success(req, res, 'get product list success', results,last);
        }  
    })
    .catch(function(err) {
        tools.error(req,res,'get product detail fail',errorConfig.ACTION_FAIL,err);
    })
})

Parse.Cloud.define('getProductDetailWithSKU',function(req,res) {
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var sku = req.params.sku;
    if(!sku) {
        tools.error(req,res,'id was not undefine',errorConfig.REQUIRE);
    }
    var productDetailQuery = new Parse.Query('ProductDetail');
    productDetailQuery.equalTo('sku',sku);
    productDetailQuery.include('product');
    productDetailQuery.include('promotion');
    productDetailQuery.notContainedIn('status',['delete','block']);
    productDetailQuery.find()
    .then(function(results){
        tools.success(req,res,'get product detail success', results);
    })
    .catch(function(err) {
        tools.error(req,res,'get product detail fail',errorConfig.ACTION_FAIL,err);
    })
})



