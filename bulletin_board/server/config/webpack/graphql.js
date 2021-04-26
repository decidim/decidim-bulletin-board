module.exports = {
  resolve: {
    extensions: [".gql"],
  },
  module: {
    rules: [
      {
        test: /\.(graphql|gql)$/,
        loader: "graphql-tag/loader",
      },
    ],
  },
};
