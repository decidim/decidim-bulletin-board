module.exports = {
  env: {
    browser: true,
    es2021: true,
    "jest/globals": true,
    jasmine: true,
  },
  extends: ["standard", "prettier"],
  plugins: ["jest", "jasmine"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {},
};
