const { webpackConfig, merge } = require("@rails/webpacker");
const graphqlConfig = require("./graphql");

module.exports = merge(webpackConfig, graphqlConfig);
