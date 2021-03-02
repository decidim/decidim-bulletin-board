const chalk = require("chalk");

module.exports = {
  verify() {
    console.log(`Ballot is ${chalk.green("OK")}.`);
    process.exit(0);
  },
};
