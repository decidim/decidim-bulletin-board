const chalk = require("chalk");

const {
  extractElectionFile,
  createAllElectionFilesStream,
} = require("../file-utils");

// Verifiers
const { verifyChainedHashes } = require("./verifiers/chained-hash.verifier");
const {
  verifyElection,
} = require("decidim-bulletin_board-verifier-electionguard");

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
    const electionFilesStream = createAllElectionFilesStream(electionDataPath);

    console.log(`${chalk.yellow("Verifying election...")}`);

    await Promise.all([
      verifyChainedHashes(electionFilesStream),
      verifyElection(electionFilesStream),
    ]);
  },
};
