/* eslint-disable */
const {
  getConfig,
  applyEntries,
  getBaseConfig,
  dev,
} = require('./webpack.config.base');
const { join } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const webpack = require('webpack');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
/* eslint-enable */

const PORT = 4444;

// Common optimization config
const splitChunksConfig = {
  chunks: 'all',
  maxSize: 244 * 1024,
  cacheGroups: {
    vendors: {
      test: /[\\/]node_modules[\\/]/,
      priority: -10,
      reuseExistingChunk: true,
    },
  },
};

// Common performance thresholds (512KB to avoid warnings)
const performanceConfig = {
  maxEntrypointSize: 512 * 1024,
  maxAssetSize: 512 * 1024,
};

const appConfig = getConfig(getBaseConfig('app'), {
  target: 'web',
  devServer: {
    static: {
      directory: join(__dirname, 'build'),
    },
    port: PORT,
    hot: true,
    allowedHosts: 'all',
  },

  optimization: {
    splitChunks: splitChunksConfig,
    runtimeChunk: false,
  },

  performance: performanceConfig,

  plugins: [
    new NodePolyfillPlugin({ excludeAliases: ['process'] }),
    ...(dev ? [
      new webpack.HotModuleReplacementPlugin(),
      new ReactRefreshWebpackPlugin(),
    ] : []),
  ],
});

const extPopupConfig = getConfig({
  target: 'web',

  entry: {},
  output: {},

  optimization: {
    splitChunks: splitChunksConfig,
    runtimeChunk: false,
  },

  performance: performanceConfig,

  plugins: [],
});

applyEntries(appConfig, [
  ...(process.env.ENABLE_AUTOFILL ? ['form-fill', 'credentials'] : []),
  'app',
  'permissions',
  'auth',
  'find',
  'menu',
  'search',
  'menuExtra',
  'incognitoMenu',
  'preview',
  'tabgroup',
  'downloads-dialog',
  'add-bookmark',
  'zoom',
  'settings',
  'history',
  'newtab',
  'bookmarks',
]);

if (process.env.ENABLE_EXTENSIONS) {
  extPopupConfig.entry['extension-popup'] = [
    `./src/renderer/views/extension-popup`,
  ];
  extPopupConfig.plugins.push(
    new HtmlWebpackPlugin({
      title: 'lunarwolf',
      template: 'static/pages/extension-popup.html',
      filename: `extension-popup.html`,
      chunks: [`vendor.app`, 'extension-popup'],
    }),
  );

  module.exports = [appConfig, extPopupConfig];
} else {
  module.exports = appConfig;
}
