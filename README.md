# Replace Resources Plugin

[![npm][npm-image]][npm-url]
[![MIT License][mit-license-image]][mit-license-url]

[npm-url]: https://www.npmjs.com/package/replace-resources-plugin
[npm-image]: https://img.shields.io/npm/v/replace-resources-plugin.svg?label=npm%20version
[mit-license-url]: LICENSE
[mit-license-image]: https://camo.githubusercontent.com/d59450139b6d354f15a2252a47b457bb2cc43828/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f6c2f7365727665726c6573732e737667

A webpack plugin to copy data from the source file to a target one

## Installation

`npm install --save-dev replace-resources-plugin`

## Usage

Add the plugin to your webpack config. For example:

**webpack.config.js**

```js
const ReplaceResourcesPlugin = require('replace-resource-plugin');

const webpackConfig = {
    plugins: [
        new ReplaceResourcesPlugin(/\.src\.js/, /\.dist\.js/),
    ],
};

module.exports = webpackConfig;
```
## Parameters

The plugin requires two parameters:

```js
new ReplaceResourcesPlugin(sourceRegExp, distRegExp [, options]),
```

Which must be regular expressions and mean to be used to detect a source file of data and a destination file where the data must be copied to.
The destination regular expression is applied firstly if it matches the file name. If this condition is true then the source regular expression is used to find whether there is the file matching it in the current working directory. If the source file is found the data of it is being copied to a destination one.

* **sourceRegExp**: `RegExp`
* **distRegExp**: `RegExp`
* **options**: `Object` - optional
    * **replaceDistFileIfHMR**: `Boolean`, default: `false` - defines if the plugin must process changes that are happening due to [Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/) on a destination file. By default changes are happening in the runtime and detected by HMR will be ignored in order to avoid infinite loop of replacmemts between source and destination files.
