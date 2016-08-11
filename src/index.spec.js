import WebpackSalesforcePlugin from './index';
import {expect} from 'chai';
import sinon from 'sinon';

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
        it('should register on the `done` step', () => {
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
            expect(args[0]).to.equal('done');
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
    });

    describe('uploadFiles function', () => {
        it('should support an explicit file path');

        it('should support the glob format');

        it('should require the resource name');

        it('should require at least 1 file');

        it('should zip the files that are matched');

        it('should upload the resource to salesforce');
    });
});