const TerserPlugin = require("terser-webpack-plugin");

const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(
      __dirname,
      "..",
      "ruby-client",
      "app",
      "assets",
      "javascripts",
      "decidim",
      "bulletin_board"
    ),
    filename: "decidim-bulletin_board.js",
    library: "decidimBulletinBoard",
    libraryTarget: "window",
  },
  resolve: {
    extensions: [".js", ".gql"],
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: "graphql-tag/loader",
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
};
