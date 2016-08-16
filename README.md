# webpack-salesforce-plugin

[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
[![Build Status](https://travis-ci.org/nadrees/webpack-salesforce-plugin.svg?branch=master)](https://travis-ci.org/nadrees/webpack-salesforce-plugin)

A small configurable plugin that can zip and deploy bundle files to Salesforce as static resources.

## Installation

```npm install webpack-salesforce-plugin```

## Configuration

Modify your ```webpack.config.js``` as follows:

```js
var WebpackSalesforcePlugin = require('webpack-salesforce-plugin');

module.exports = {
    ...
    plugins: [
        new WebpackSalesforcePlugin(options)
    ]
    ...
};
```

### Options

This plugin supports configuration through the passed in arguments. The ```options``` paramater has the structure:

```js
{
    salesforce: {
      username: 'username', // the username to log in to Salesforce with
      password: 'password', // the users password
      token: '', // the security token, if needed. May be null or empty string if not required. Default ''.
      loginUrl: 'https://login.salesforce.com' // the url to log in to salesforce with. Generally one of https://test.salesforce.com or https://login.salesforce.com. Default 'https://login.salesforce.com'.
    },
    resources: [
        {
            name: 'resource1', //the name of the static resource to be created/updated in Salesforce
            files: ['dist/bundle1.js', 'dist/**/*.bundle.js'] // the files to include in the static resource folder, may be in glob format
        }
    ]
}
```