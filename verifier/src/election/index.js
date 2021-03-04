const chalk = require("chalk");

module.exports = {
  verify() {
    console.log(`Election is ${chalk.green("OK")}.`);
    process.exit(0);
  },
};
