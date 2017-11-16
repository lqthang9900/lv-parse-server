var config = require('../config/config');
function getUserById(userId) {
    var userQuery = new Parse.Query('User');
    return userQuery.get(userId);
}
function cloneUserInfo(user, fields) {
    var userClone = new Parse.User();
    userClone.id = user.id;
    for (var i in fields) {
        userClone.set(fields[i], user.get(fields[i]));
    }
    var userCloneJSON = userClone.toJSON();
    userCloneJSON.id = userClone.id;
    userCloneJSON.className = userClone.className;
    userClone = Parse.Object.fromJSON(userCloneJSON);
    if (userClone.get('avatar')) userClone.get('avatar')._url = config.httpsDomain + userClone.get('avatar').url().split('parse')[1];
    return userClone;
}
function success(req, res, message, data, lastPage) {
    var responseData = {
        success: true,
        message: message,
        data: data
    }
    if(lastPage) {
        responseData.lastPage = lastPage;
    }
    else {
        responseData.lastPage = false;
    }
    if (res) res.success(responseData);
    else return responseData;
}

function error(req, res, message, error, code) {
    var responseData = {
        success: false,
        message: message,
        error: error,
        code: code
    }
    if (res) {
        if (code) {
            res.error(code, responseData);
        } else {
            res.error(responseData);
        }
    }
    else return responseData;
}
function notLogin(req,res) {
    error(req,res, 'you are not login');
}

module.exports = {
    getUserById,
    cloneUserInfo,
    notLogin,
    error,
    success
}