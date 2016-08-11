import WebpackSalesforcePlugin from './index';

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
            }
        };
    });

    describe('prototype', () => {
        it('should have an `apply` function', () => {
            expect(WebpackSalesforcePlugin.prototype.apply).not.toBeNull();
        });
    });

    describe('apply function', () => {
        it('should register on the `done` step', () => {
            let compiler = {
                plugin: function () {}
            };
            spyOn(compiler, 'plugin');

            let plugin = createInstance();

            plugin.apply(compiler);

            expect(compiler.plugin).toHaveBeenCalled();
            expect(compiler.plugin.calls.count()).toBe(1);

            let args = compiler.plugin.calls.mostRecent().args;
            expect(args.length).toBe(2);
            expect(args[0]).toBe('done');
            expect(args[1]).not.toBeNull();
        });
    });

    describe('constructor', () => {
        it('should handle the `salesforce` key missing', () => {
            delete args.salesforce;

            expect(createInstance).toThrowError(/(username|password)/);
        });

        it('should validate that the username is required', () => {
            args.salesforce.username = null;

            expect(createInstance).toThrow();
        });

        it('should validate that the password is required', () => {
            args.salesforce.password = null;

            expect(createInstance).toThrow();
        });

        it('should default the security token to empty string', () => {
            let plugin = createInstance();

            expect(plugin.options.salesforce.token).toBe('');
        });

        it('should not override the security token if present', () => {
            args.salesforce.token = 'test-token';

            let plugin = createInstance();

            expect(plugin.options.salesforce.token).toBe(args.salesforce.token);
        });

        it('should default the login url to `https://login.salesforce.com`', () => {
            let plugin = createInstance();

            expect(plugin.options.salesforce.loginUrl).toBe('https://login.salesforce.com');
        });

        it('should not override the login url if present', () => {
            args.salesforce.loginUrl = 'https://test.salesforce.com';

            let plugin = createInstance();

            expect(plugin.options.salesforce.loginUrl).toBe(args.salesforce.loginUrl);
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