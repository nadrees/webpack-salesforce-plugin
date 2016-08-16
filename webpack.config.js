var path = require('path'),
    nodeExternals = require('webpack-node-externals');

var BUILD_DIR = path.resolve(__dirname, 'dist');
var APP_DIR = path.resolve(__dirname, 'src');

var config = {
    entry: {
        main: APP_DIR + '/index.js'
    },
    output: {
        path: BUILD_DIR,
        filename: 'webpackSalesforcePlugin.js',
        libraryTarget: 'commonjs2',
        library: 'WebpackSalesforcePlugin'
    },
    module: {
        loaders: [
            {test: /\.js/, include: APP_DIR, loader: 'babel'},
            {test: /\.json/, loader: 'json'}
        ]
    },
    target: 'node',
    externals: [nodeExternals({
        whitelist: ['object-assign', 'glob', 'lodash', 'node-zip']
    })]
};

module.exports = config;