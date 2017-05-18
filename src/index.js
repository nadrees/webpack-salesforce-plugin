import fs from 'fs';

import objectAssign from 'object-assign';
import {Connection} from 'jsforce';
import glob from 'glob';
import {union} from 'lodash';
import Zip from 'node-zip';

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

        this.options.resources.forEach((resource) => {
            if (!resource.name)
                throw new Error('Resource name is required.');
        });

        this.conn = new Connection({loginUrl: this.options.salesforce.loginUrl});
    }

    apply(compiler) {
        compiler.plugin('after-emit', this.uploadFiles.bind(this))
    }

    uploadFiles(compilation, done) {
        let resources = this.__globFiles().map((resource) => this.__zipResource(resource));
        this.__doUpload(resources, done);
    }

    __doUpload(resources, done) {
        console.log('Logging in to Salesforce.');
        
        this.conn.login(this.options.salesforce.username, this.options.salesforce.password + (this.options.salesforce.token || ''), (err, res) => {
            if (err) {
                console.error(err);
                done();
            }
            else {
                console.log('Connected to Salesforce. Uploading resources.');
                this.conn.metadata.upsert('StaticResource', resources, (err, results) => {
                    if (err)
                        console.error(err);
                    else {
                        if (results && results.length) {
                            results.filter((r) => !r.success).forEach((r) => console.error(r));
                        }
                    }

                    done();
                });
            }
        });
    }

    __zipResource(globbedResource) {
        if (globbedResource.files.length === 0) {
            throw new Error('Resource ' + name + ' matched no files.');
        }

        let zip = new Zip();
        globbedResource.files.forEach((f) => {
            if(f.match(/.*?woff(2?)$/)){
                let data = fs.readFileSync(f);
                zip.file(f, data);
            } else {
                let data = fs.readFileSync(f, 'utf8');
                zip.file(f, data);
            }
        });

        return {
            fullName: globbedResource.name,
            content: zip.generate({ base64: true, compression: 'DEFLATE' }),
            contentType: 'application/zip'
        };
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

module.exports = WebpackSalesforcePlugin;