"use strict";

class ReplaceResourcesPlugin {
    constructor(copyFromFileRegExp, copyToFileRegExp) {
        this.copyFromFileRegExp = copyFromFileRegExp;
        this.copyToFileRegExp = copyToFileRegExp;
    }

    processError(err) {
        console.log('The below error occurred in the ReplaceResourcesPlugin:');
        console.error(err);
        process.exit(1);
    }

    scanDirectory(directory) {
        return new Promise((resolve, reject) => {
            fs.readdir(directory, (err, files) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(files);
            });
        });
    }

    exportFileData(file) {
        return new Promise((resolve, reject) => {
            fs.readFile(file, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(data);
            });
        });
    }

    async copyFileData(context, srcFile, distFile) {
        const srcFilePath = path.resolve(
            context,
            srcFile,
        );

        const data = await this.exportFileData(srcFilePath);

        fs.writeFile(distFile, data, (err) => {
            if (err) {
                this.processError(err);
            }
        });
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(
            'ReplaceResourcesPlugin',
            (compilation) => {
                compilation.hooks.buildModule.tap('ReplaceResourcesPlugin', async (result) => {
                    if (!result) {
                        return null;
                    }

                    try {
                        if (this.copyToFileRegExp.test(result.resource)) {
                            const files = await this.scanDirectory(result.context);

                            for (let i = 0; i < files.length; i += 1) {
                                const matchedFile = this.copyFromFileRegExp.exec(files[i]);

                                if (matchedFile) {
                                    this.copyFileData(result.context, matchedFile.input, result.resource);
                                    return result;
                                }
                            }
                            return result;
                        }

                        return result;
                    } catch (err) {
                        this.processError(err);
                    }
                });
            },
        );
    }
}

module.exports = ReplaceResourcesPlugin