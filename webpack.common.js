// webpack.common.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "main.js", // Simpler filename for dev; overridden in prod
    path: path.resolve(__dirname, "dist"),
    clean: true, // Ensures output directory is cleared before each build
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html", // Template for HTML file
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"], // Handles CSS files
      },
      {
        test: /\.html$/i,
        loader: "html-loader", // Processes HTML files
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource", // Handles static assets (e.g., images)
        generator: {
          filename: "images/[name].[contenthash][ext]",
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: "fonts/[name].[contenthash][ext]",
        },
      },
    ],
  },
};