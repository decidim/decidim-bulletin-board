module.exports = {
  env: {
    browser: true,
    es2021: true,
    "jest/globals": true,
    jasmine: true,
  },
  globals: {
    cy: false,
  },
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
