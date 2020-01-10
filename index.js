const path = require('path');
const fs = require('fs');

const defaultOptions = {
	replaceDistFileIfHMR: false,
};

class ReplaceResourcesPlugin {
	constructor(copyFromFileRegExp, copyToFileRegExp, options = defaultOptions) {
		this.name = 'ReplaceResourcesPlugin';

		this.copyFromFileRegExp = copyFromFileRegExp;
		this.copyToFileRegExp = copyToFileRegExp;

		this.sourceFilesStore = {};
		this.distFilesStore = {};

		this.listenToHMR = options.replaceDistFileIfHMR;
	}

	processError(err) {
		console.log(`The below error occurred in the ${this.name}:`);
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

	resolvePath(context, filename) {
		return path.resolve(
			context,
			filename,
		);
	}

	async copyFileData(srcFilePath, distFilePath) {
		const data = await this.exportFileData(srcFilePath);

		fs.writeFile(distFilePath, data, (err) => {
			if (err) {
				this.processError(err);
			}
		});
	}

	storeFile(context, srcFile, distFilePath) {
		const srcFilePath = this.resolvePath(context, srcFile);

		this.sourceFilesStore[srcFilePath] = {
			dist: distFilePath,
		};
		this.distFilesStore[distFilePath] = true;

		this.copyFileData(srcFilePath, distFilePath);

		fs.watchFile(srcFilePath, () => {
			console.log(`${this.name}: ${srcFile} has been changed`);
			this.copyFileData(srcFilePath, distFilePath);
		});
	}

	isDistFileStored(distFilePath) {
		return !!this.distFilesStore[distFilePath];
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
						const { resource, context, hotUpdate } = result;

						if (
							!this.isDistFileStored(resource) &&
                            this.copyToFileRegExp.test(resource) &&
                            (hotUpdate === undefined ||
                            (hotUpdate === true && this.listenToHMR))
						) {
							const files = await this.scanDirectory(context);

							for (let i = 0; i < files.length; i += 1) {
								const matchedFile = this.copyFromFileRegExp.exec(files[i]);

								if (matchedFile) {
									this.storeFile(context, matchedFile.input, resource);
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

module.exports = ReplaceResourcesPlugin;