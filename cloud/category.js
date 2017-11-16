Parse.Cloud.useMasterKey();
var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    tools = require('./tools');
    errorConfig = require('../config/error-config')

Parse.Cloud.define('getCategoryList', function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var query = new Parse.Query('Category');
    var limit = req.params.limit;
    var page = req.params.page;
    if(!limit || !page) {
        tools.error(req,res, 'params was not undefine', errorConfig.REQUIRE);
    }
    else {
        limit = parseInt(limit);
        page = parseInt(page);
        if(page < 1) {
            tools.error(req,res, 'page must be larger than 0', errorConfig.ERROR_PARAMS);
            return;
        }
        if(limit < 1) {
            tools.error(req,res, 'limit must be larger than 0', errorConfig.ERROR_PARAMS);
            return;
        }
    }
    query.notContainedIn('status', ['delete','block']);
    query.limit(limit);
    query.skip((page-1)*limit);
    query.find({
        success: function(results) {
            tools.success(req, res, 'get category list successfully', results);
        },
        error: function(error) {
            tools.error(req, res, 'error get list category',error, errorConfig.ACTION_FAIL);
        }
    });
})
