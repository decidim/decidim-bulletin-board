module.exports = {
  env: {
    browser: true,
    es2021: true,
    jasmine: true,
  },
  globals: {
    cy: false,
    $: false,
  },
  extends: ["standard", "prettier"],
  plugins: ["jasmine"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "jest/no-focused-tests": 2,
  },
};
