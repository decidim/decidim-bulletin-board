const TerserPlugin = require("terser-webpack-plugin");

const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(
      __dirname,
      "..",
      "ruby-adapter",
      "app",
      "assets",
      "javascripts",
      "voting_schemes",
      "electionguard"
    ),
    filename: "electionguard.js",
    library: "electionGuardVotingScheme",
    libraryTarget: "window",
  },
  resolve: {
    extensions: [".js"],
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
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
