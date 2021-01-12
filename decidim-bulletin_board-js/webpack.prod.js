const merge = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",
  plugins: [new CleanWebpackPlugin()],
  output: {
    filename: "[name].prod.js",
  },
});
