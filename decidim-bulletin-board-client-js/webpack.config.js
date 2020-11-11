const path = require("path");

module.exports = (env) => ({
  mode: env.development ? "development" : "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    library: "decidimBulletinBoard",
    libraryTarget: "window",
  },
  devtool: "inline-source-map",
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
});
