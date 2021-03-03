const chalk = require("chalk");

const { extractElectionFile } = require("../file-utils");
const { verifyChainedHashes } = require("./verifiers/chained-hash.verifier");

/**
 * Includes all the business logic to verify an election log file.
 *
 * @module
 */
module.exports = {
  /**
   * Extracts the election log file and run some verifiers:
   *  - `verifyChainedHashes`: Check if the chained hashes are correct or not.
   *
   * @param {String} path - an election log entry file path.
   * @returns {Promise<undefined>}
   */
  async verify(path) {
    const electionDataPath = await extractElectionFile(path);

    console.log(`${chalk.yellow("Verifying election...")}`);

    await verifyChainedHashes(electionDataPath);
  },
};
