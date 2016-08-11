import WebpackSalesforcePlugin from './index';

describe('The WebpackSalesforcePlugin', () => {
    describe('prototype', () => {
        it('should have an `apply` function', () => {
            expect(WebpackSalesforcePlugin.prototype.apply).not.toBeNull();
        });
    });

    describe('apply function', () => {
        it('should register on the `done` step', () => {
            pending();
        });
    });

    describe('constructor', () => {
        it('should validate that the username is required', () => {
            pending();
        });

        it('should validate that the password is required', () => {
            pending();
        });

        it('should default the security token to empty string', () => {
            pending();
        });

        it('should not override the security token if present', () => {
            pending();
        });

        it('should default the login url to `https://login.salesforce.com`', () => {
            pending();
        });

        it('should not override the login url if present', () => {
            pending();
        });
    });

    describe('uploadFiles function', () => {
        it('should support an explicit file path', () => {
            pending();
        });

        it('should support the glob format', () => {
            pending();
        });

        it('should require the resource name', () => {
            pending();
        });

        it('should require at least 1 file', () => {
            pending();
        });

        it('should zip the files that are matched', () => {
            pending();
        });

        it('should upload the resource to salesforce', () => {
            pending();
        });
    });
});