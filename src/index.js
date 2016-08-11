const objectAssign = require('object-assign');

class WebpackSalesforcePlugin {
    constructor(options = {}) {
        let defaultOptions = {
            salesforce: {
                username: null,
                password: null,
                token: '',
                loginUrl: 'https://login.salesforce.com'
            }
        };

        let mergedOptions = objectAssign({}, options);
        mergedOptions.salesforce = objectAssign({}, defaultOptions.salesforce, options.salesforce);

        this.options = mergedOptions;

        if (!this.options.salesforce.username)
            throw new Error('salesforce.username is required.');
        if (!this.options.salesforce.password)
            throw new Error('salesforce.password is required.');
    }

    apply(compiler) {
        compiler.plugin('done', this.uploadFiles.bind(this))
    }

    uploadFiles() {

    }
}

export default WebpackSalesforcePlugin;