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
  resolve: {
    extensions: [".js", ".gql"],
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
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: "graphql-tag/loader",
      },
    ],
  },
});
