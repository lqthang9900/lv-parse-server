var crypto = require('crypto');
function encodeDateYMD(date, symbol, numberOfYear){
    if(!symbol) symbol = '';
    if(!numberOfYear) numberOfYear = 2;
    date = new Date(date);
    var year = date.getFullYear() + '';
    year = year.substr(year.length - numberOfYear, numberOfYear);
    var month = date.getMonth() + 1;
    month = (month >= 10) ? '' + month : '0' + month;
    var day = date.getDate();
    day = (day >= 10) ? '' + day : '0' + day;
    return year + symbol + month + symbol + date;
}
var randomValueHex  = function (len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len);   // return required number of characters
};
module.exports = {
    encodeDateYMD,
    randomValueHex
}