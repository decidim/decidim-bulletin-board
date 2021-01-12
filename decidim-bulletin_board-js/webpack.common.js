const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "..", "decidim-bulletin_board-ruby", "app", "assets","javascripts", "decidim", "bulletin_board"),
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
};
