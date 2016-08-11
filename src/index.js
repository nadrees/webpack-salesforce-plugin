import objectAssign from 'object-assign';
import {Connection} from 'jsforce';
import glob from 'glob';
import {union} from 'lodash';

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
        let globbedResources = this.__globFiles();

        globbedResources.forEach((resource) => {
            this.__doUpload(resource);
        });
    }

    __doUpload(globbedResource) {

    }

    __globFiles() {
        return this.options.resources.map((resource) => {
            let filesToZip = resource.files.map((fileGlob) => {
                return glob.sync(fileGlob, {});
            }).reduce((currentList, nextList) => {
                return union(currentList, nextList);
            }, []);

            return {
                name: resource.name,
                files: filesToZip
            }
        });
    }
}

export default WebpackSalesforcePlugin;