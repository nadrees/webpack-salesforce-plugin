import WebpackSalesforcePlugin from './index';
import {expect} from 'chai';
import sinon from 'sinon';
import Zip from 'node-zip';
import glob from 'glob';

describe('The WebpackSalesforcePlugin', () => {
    let args;

    function createInstance() {
        return new WebpackSalesforcePlugin(args);
    }

    beforeEach(() => {
        args = {
            salesforce: {
                username: 'test@example.com',
                password: 'testpassword'
            },
            resources: []
        };
    });

    describe('prototype', () => {
        it('should have an `apply` function', () => {
            expect(WebpackSalesforcePlugin.prototype.apply).to.not.be.null;
        });
    });

    describe('apply function', () => {
        it('should register on the `after-emit` step', () => {
            let compiler = {
                plugin: function () {}
            };
            sinon.spy(compiler, 'plugin');

            let plugin = createInstance();

            plugin.apply(compiler);

            expect(compiler.plugin.called).to.be.true;
            expect(compiler.plugin.callCount).to.equal(1);

            let args = compiler.plugin.lastCall.args;
            expect(args.length).to.equal(2);
            expect(args[0]).to.equal('after-emit');
            expect(args[1]).not.to.be.null;
        });
    });

    describe('constructor', () => {
        it('should handle the `salesforce` key missing', () => {
            delete args.salesforce;

            expect(createInstance).to.throw(/(username|password)/);
        });

        it('should validate that the username is required', () => {
            args.salesforce.username = null;

            expect(createInstance).to.throw();
        });

        it('should validate that the password is required', () => {
            args.salesforce.password = null;

            expect(createInstance).to.throw();
        });

        it('should default the security token to empty string', () => {
            let plugin = createInstance();

            expect(plugin.options.salesforce.token).to.equal('');
        });

        it('should not override the security token if present', () => {
            args.salesforce.token = 'test-token';

            let plugin = createInstance();

            expect(plugin.options.salesforce.token).to.equal(args.salesforce.token);
        });

        it('should default the login url to `https://login.salesforce.com`', () => {
            let plugin = createInstance();

            expect(plugin.options.salesforce.loginUrl).to.equal('https://login.salesforce.com');
        });

        it('should not override the login url if present', () => {
            args.salesforce.loginUrl = 'https://test.salesforce.com';

            let plugin = createInstance();

            expect(plugin.options.salesforce.loginUrl).to.equal(args.salesforce.loginUrl);
        });

        it('should default the `resources` key to an empty array', () => {
            delete args.resources;

            let plugin = createInstance();

            expect(plugin.options.resources).to.eql([]);
        });

        it('should require the resource name', () => {
            args.resources.push({
                name: null,
                files: ['test/*.js']
            });

            expect(createInstance).to.throw();
        });
    });

    describe('uploadFiles function', () => {
        let plugin = null,
            stub = null;

        beforeEach(() => {
            args.resources.push({
                name: 'test',
                files: ['test/*.js']
            });

            plugin = createInstance();
            stub = sinon.stub(plugin, '__doUpload');
        });

        it('should support an explicit file path', () => {
            let zipFilesStub = sinon.stub(plugin, '__zipResource');

            plugin.options.resources = [{
                name: 'test',
                files: ['test/file1.js']
            }];

            plugin.uploadFiles();

            expect(zipFilesStub.calledOnce).to.be.true;

            let args = zipFilesStub.lastCall.args;
            expect(args.length).to.equal(1);
            expect(args[0].name).to.equal(plugin.options.resources[0].name);
            expect(args[0].files.length).to.equal(1);
        });

        it('should support the glob format', () => {
            let zipFilesStub = sinon.stub(plugin, '__zipResource');

            plugin.uploadFiles();

            expect(zipFilesStub.calledOnce).to.be.true;

            let args = zipFilesStub.lastCall.args;
            expect(args.length).to.equal(1);
            expect(args[0].name).to.equal(plugin.options.resources[0].name);
            expect(args[0].files.length).to.equal(2);
        });

        it('should dedup files if matched multiple times', () => {
            let zipFilesStub = sinon.stub(plugin, '__zipResource');

            plugin.options.resources = [{
                name: 'test',
                files: ['test/*.js', 'test/file1.js']
            }];

            plugin.uploadFiles();

            expect(zipFilesStub.calledOnce).to.be.true;

            let args = zipFilesStub.lastCall.args;
            expect(args.length).to.equal(1);
            expect(args[0].name).to.equal(plugin.options.resources[0].name);
            expect(args[0].files.length).to.equal(2);
        });

        it('should require at least 1 file to be matched', () => {
            plugin.options.resources = [{
                name: 'test',
                files: []
            }];

            expect(() => plugin.uploadFiles()).to.throw();
        });

        it('should zip the files that are matched', () => {
            plugin.uploadFiles();

            expect(stub.calledOnce).to.be.true;

            let args = stub.lastCall.args;
            expect(args.length).to.equal(2);

            let resource = args[0][0];
            expect(resource.fullName).to.equal(plugin.options.resources[0].name);

            let fileNames = glob.sync('test/*.js');
            let zip = Zip(resource.content, {base64: true});

            fileNames.forEach((fName) => {
                expect(zip.files[fName]).to.exist;
            });
        });

        it('should call the login function with the correct arguments', () => {
            plugin.options.salesforce.token = 'testtoken';

            stub.restore();

            sinon.stub(plugin.conn, 'login');

            plugin.uploadFiles(null, () => {});

            expect(plugin.conn.login.calledOnce).to.be.true;

            let args = plugin.conn.login.lastCall.args;
            expect(args.length).to.equal(3);
            expect(args[0]).to.equal(plugin.options.salesforce.username);
            expect(args[1]).to.equal(plugin.options.salesforce.password + plugin.options.salesforce.token);
        });

        it('should correctly format the resources to be uploaded', () => {
            plugin.uploadFiles(null, () => {});

            let args = stub.lastCall.args;
            expect(args.length).to.equal(2);

            expect(args[0].length).to.be.greaterThan(0);
            args[0].forEach((resource) => {
                expect(resource.fullName).to.exist;
                expect(resource.fullName).to.not.be.null;

                expect(resource.content).to.exist;
                expect(resource.content).to.not.be.null;

                expect(resource.contentType).to.exist;
                expect(resource.contentType).to.not.be.null;
            });
        });

        describe('when uploading to Salesforce', () => {
            beforeEach(() => {
                stub.restore();

                sinon.stub(plugin.conn, 'login');
            });

            describe('and when the connection is valid', () => {
                beforeEach(() => {
                    plugin.conn.login.callsArgWith(2, null, null);

                    sinon.stub(plugin.conn.metadata, 'upsert');
                });

                it('should call the metadata API ```upsert``` function with the correct arguments', (done) => {
                    plugin.conn.metadata.upsert.callsArg(2);

                    plugin.uploadFiles(null, () => {
                        expect(plugin.conn.metadata.upsert.calledOnce).to.be.true;

                        let args = plugin.conn.metadata.upsert.lastCall.args;
                        expect(args.length).to.equal(3);
                        expect(args[0]).to.equal('StaticResource');
                        expect(args[1].length).to.exist;

                        done();
                    });
                });

                describe('and the metadata call succeeds', () => {
                    beforeEach(() => {
                        plugin.conn.metadata.upsert.callsArgWith(2, null, [
                            {success: true},
                            {success: false, error: 'test'}
                        ]);
                    });

                    it('should report any errors found', (done) => {
                        sinon.spy(console, 'error');

                        plugin.uploadFiles(null, () => {
                            expect(console.error.calledOnce).to.be.true;

                            done();
                        });
                    });
                });

                describe('and the metadata call fail', () => {
                    beforeEach(() => {
                        plugin.conn.metadata.upsert.callsArgWith(2, 'Test Error', null);
                    });

                    it('should report the error to console.error', (done) => {
                        sinon.spy(console, 'error');

                        plugin.uploadFiles(null, () => {
                            expect(console.error.calledOnce).to.be.true;

                            done();
                        });
                    });
                });
            });

            describe('and when the connection is invalid', () => {
                beforeEach(() => {
                    plugin.conn.login.callsArgWith(2, 'Test Error', null);

                    sinon.spy(plugin.conn.metadata, 'upsert');
                });

                it('should not call the metadata API', (done) => {
                    plugin.uploadFiles(null, () => {
                        expect(plugin.conn.login.calledOnce).to.be.true;
                        expect(plugin.conn.metadata.upsert.called).to.be.false;

                        done();
                    });
                });

                it('should report the error to console.error', (done) => {
                    sinon.spy(console, 'error');

                    plugin.uploadFiles(null, () => {
                        expect(console.error.calledOnce).to.be.true;

                        let args = console.error.lastCall.args;
                        expect(args.length).to.equal(1);
                        expect(args[0]).to.equal('Test Error');

                        done();
                    });
                });
            });
        });
    });

    // clean up the spies on console.* methods
    // to prevent any issues when running tests in 'watch' mode
    afterEach(() => {
        if(console.log.restore) {
            console.log.restore();
        }

        if (console.error.restore) {
            console.error.restore();
        }
    });
});