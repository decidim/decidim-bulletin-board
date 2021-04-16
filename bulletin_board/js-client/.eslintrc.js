module.exports = {
  env: {
    browser: true,
    es2021: true,
    jasmine: true,
    "jest/globals": true,
  },
  globals: {},
  extends: ["standard", "prettier"],
  plugins: ["jest", "jasmine"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "jest/no-focused-tests": 2,
  },
};
