import objectAssign from 'object-assign';
import {Connection} from 'jsforce';
import glob from 'glob';

class WebpackSalesforcePlugin {
    constructor(options = {}) {
        let defaultOptions = {
            salesforce: {
                username: null,
                password: null,
                token: '',
                loginUrl: 'https://login.salesforce.com'
            },
            resources: []
        };

        let mergedOptions = objectAssign({}, options);
        mergedOptions.salesforce = objectAssign({}, defaultOptions.salesforce, options.salesforce);
        mergedOptions.resources = options.resources || defaultOptions.resources;

        this.options = mergedOptions;

        if (!this.options.salesforce.username)
            throw new Error('salesforce.username is required.');
        if (!this.options.salesforce.password)
            throw new Error('salesforce.password is required.');

        this.conn = new Connection({loginUrl: this.options.salesforce.loginUrl});
    }

    apply(compiler) {
        compiler.plugin('done', this.uploadFiles.bind(this))
    }

    uploadFiles() {

    }
}

export default WebpackSalesforcePlugin;