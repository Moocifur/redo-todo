// webpack.dev.js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map", // Source maps for debugging
  devServer: {
    static: false, // No need to serve a static folder since HTML is in memory
    watchFiles: {
      paths: ["./src/**/*.html", "./src/**/*.css"], // Watch HTML and CSS
      options: {
          ignored: /node_modules/, // Exclude node_modules
      },
    },
    open: true, // Automatically open browser
    hot: true,  // Enable Hot Module Replacement
  },
});