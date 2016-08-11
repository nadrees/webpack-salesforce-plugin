var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'dist');
var APP_DIR = path.resolve(__dirname, 'src');

var config = {
    entry: {
        main: APP_DIR + '/index.js'
    },
    output: {
        path: BUILD_DIR,
        filename: 'webpackSalesforcePlugin.js'
    },
    module: {
        loaders: [
            {test: /\.js/, include: APP_DIR, loader: 'babel'},
            {test: /\.json/, loader: 'json'}
        ]
    },
    externals: {
    }
};

module.exports = config;