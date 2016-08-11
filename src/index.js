class WebpackSalesforcePlugin {
    constructor(options = {}) {
        this.options = options;
    }

    apply(compiler) {
        compiler.plugin('done', this.uploadFiles.bind(this))
    }

    uploadFiles() {

    }
}

export default WebpackSalesforcePlugin;