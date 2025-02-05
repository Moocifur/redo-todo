//webpack.prod.js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: "production",
  output: {
    filename: 'main.[contenthash].js',  // Cache-busting filename
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },  
});