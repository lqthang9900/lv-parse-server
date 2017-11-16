var env = process.env.ENV || 'dev'
, path = require('path')
, configs = {};
var url = 'http://192.168.1.127:';
configs.dev = {
    
    port: 3000,
    httpsPort: 3000,
    dashboardUsers: [{
        user: 'root',
        pass: 'r00t'
    }],
    parseServer: {
        //  databaseURI : `mongodb://root:r00t@cluster0-shard-00-00-jzqxp.mongodb.net:27017,cluster0-shard-00-01-jzqxp.mongodb.net:27017,cluster0-shard-00-02-jzqxp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`,
        databaseURI: 'mongodb://127.0.0.1:27017/luanvanlocal',
        cloud: path.resolve('./cloud/main.js'),
        appId: process.env.APP_ID || 'luan-van-app-id',
        appName: 'LuanVan.App',
        masterKey: 'luan-van-masterkey', //Add your master key here. Keep it secret!
        serverURL: process.env.SERVER_URL || url+`3000/parse`,  // Don't forget to change to https if needed
        // liveQuery: {
        //   classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
        // }
    },
    allowInsecureHttp: true
}

configs.local = {
    port: 3000,
    httpsPort: 3001,
    dashboardUsers: [{
        user: 'root',
        pass: 'r00t'
    }],
    parseServer: {
        // databaseURI : `mongodb://root:r00t@cluster0-shard-00-00-jzqxp.mongodb.net:27017,cluster0-shard-00-01-jzqxp.mongodb.net:27017,cluster0-shard-00-02-jzqxp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`,
        // databaseURI: 'mongodb://root:r00t@cluster0-shard-00-00-jzqxp.mongodb.net:27017,cluster0-shard-00-01-jzqxp.mongodb.net:27017,cluster0-shard-00-02-jzqxp.mongodb.net:27017/luanvan?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin',
        databaseURI: 'mongodb://127.0.0.1:27017/luanvanlocal',
        cloud: path.resolve('./cloud/main.js'),
        appId: process.env.APP_ID || 'luan-van-app-id',
        appName: 'LuanVan.App',
        masterKey: 'luan-van-masterkey', //Add your master key here. Keep it secret!
        serverURL: process.env.SERVER_URL ||  url+`3000/parse`,  // Don't forget to change to https if needed
        // liveQuery: {
        //   classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
        // }
    },
    allowInsecureHttp: true
}

module.exports = configs[env];