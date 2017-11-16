// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');
var config = require('./config/config');
var dashboard = new ParseDashboard({
    apps: [config.parseServer], 
    users: config.dashboardUsers
  }, config.allowInsecureHttp)

// var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

// if (!databaseUri) {
//   console.log('DATABASE_URI not specified, falling back to localhost.');
// }

var api = new ParseServer(config.parseServer);
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use('/parse', api);
app.use('/-board', dashboard);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1300;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    // console.log('parse-server-example running on port ' + port + '.');
    console.log('------Server Information--------');
    console.log('\tEnvironment: ', process.env.ENV);
    console.log('\tServer running on port: ', config.port);
    console.log('\tApp name: ', config.parseServer.appName);
    console.log('\tApp Id: ', config.parseServer.appId);
    console.log('\tCloud: ', config.parseServer.cloud);
    console.log('\tDatabase URI: ', config.parseServer.databaseURI);
    console.log('\tMaster Key: ', config.parseServer.masterKey);
    console.log('\tServer URL: ', config.parseServer.serverURL);
    console.log('-------------End Info---------');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
