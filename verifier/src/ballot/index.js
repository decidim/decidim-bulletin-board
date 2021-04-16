import chalk from "chalk";

import { parseBallotFile } from "../file-utils.js";

// Verifiers
import { verifyEncryptedDataHash } from "./verifiers/encrypted-data-hash.verifier.js";
import { verifyBallot } from "decidim-bulletin_board-verifier-electionguard";

/**
 * Parse the ballot file and run some verifiers.
 *
 * @param {String} path - a ballot file path.
 * @returns {Promise<undefined>}
 */
export const verify = async (path) => {
  const ballotData = await parseBallotFile(path);

  console.log(`${chalk.yellow("Verifying ballot...")}`);

  return Promise.all([
    verifyEncryptedDataHash(ballotData),
    verifyBallot(ballotData),
  ]);
};
