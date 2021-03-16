const chalk = require("chalk");

/**
 * Includes all the business logic to verify an audit ballot file.
 *
 * @module
 */
module.exports = {
  /**
   * Parse the audit ballot and run some verifiers.
   *
   * @param {String} path - an audit ballot file path.
   * @returns {Promise<undefined>}
   */
  verify() {
    console.log(`${chalk.yellow("Verifying ballot...")}`);
  },
};
