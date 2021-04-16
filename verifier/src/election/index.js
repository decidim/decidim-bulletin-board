import chalk from "chalk";

import {
  extractElectionFile,
  createAllElectionFilesStream,
} from "../file-utils.js";

// Verifiers
import { verifyChainedHashes } from "./verifiers/chained-hash.verifier.js";
import { verifyElection } from "decidim-bulletin_board-verifier-electionguard";

/**
 * Extracts the election log file and run some verifiers:
 *  - `verifyChainedHashes`: Check if the chained hashes are correct or not.
 *
 * @param {String} path - an election log entry file path.
 * @returns {Promise<undefined>}
 */
export const verify = async (path) => {
  const electionDataPath = await extractElectionFile(path);
  const electionFilesStream = createAllElectionFilesStream(electionDataPath);

  console.log(`${chalk.yellow("Verifying election...")}`);

  return Promise.all([
    verifyChainedHashes(electionFilesStream),
    verifyElection(electionFilesStream),
  ]);
};
