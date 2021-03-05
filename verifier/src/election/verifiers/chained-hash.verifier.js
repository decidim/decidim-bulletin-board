const chalk = require("chalk");

const { hash } = require("../../crypto-utils");
const { readAllElectionFiles } = require("../../file-utils");

/**
 * A verifier that checks if all the `chainedHash` property in the log entries
 * are computed properly.
 *
 * @module
 */
module.exports = {
  /**
   * Whether the chained hashes are correct or not.
   *
   * @param {String} path - a directory that contains all the extracted files in a election log file.
   * @returns {Promise<Boolean>}
   */
  verifyChainedHashes(path) {
    let previousHash = null;

    return new Promise((resolve) => {
      readAllElectionFiles(
        path,
        (data, fail) => {
          const { signed_data: signedData, chained_hash: chainedHash } = data;
          // The first hash is computed using the election unique id.
          if (!previousHash) {
            const { message_id: messageId } = data;
            const [authorityName, electionId] = messageId.split(".");
            previousHash = [authorityName, electionId].join(".");
          }
          const computedHash = hash([previousHash, signedData].join("."));

          if (computedHash !== chainedHash) {
            fail(new Error("Chained hash cannot be verified."));
          } else {
            previousHash = chainedHash;
          }
        },
        () => {
          console.log(`\t${chalk.green("[OK]")} Chained hashes verified.`);
          resolve(true);
        },
        (error) => {
          console.log(`\t${chalk.red("[ERROR]")} Chained hashes verified.`);
          console.error(error);
          resolve(false);
        }
      );
    });
  },
};
