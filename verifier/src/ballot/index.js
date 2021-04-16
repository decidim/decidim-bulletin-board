import chalk from "chalk";

import { parseBallotFile } from "../file-utils.js";

// Services
import { BulletinBoardClient } from "./services/bulletin-board-client.service.js";

// Verifiers
import { verifyEncryptedDataHash } from "./verifiers/encrypted-data-hash.verifier.js";
import { verifyQuestionsAndAnswers } from "./verifiers/questions-and-answers.verifier.js";
import { verifyBallot } from "decidim-bulletin_board-verifier-electionguard";

// Constants
const BULLETIN_BOARD_API_URL =
  process.env.BULLETIN_BOARD_API_URL || "http://localhost:8000/api";

/**
 * Parse the ballot file and run some verifiers.
 *
 * @param {String} path - a ballot file path.
 * @returns {Promise<undefined>}
 */
export const verify = async (path) => {
  const ballotData = await parseBallotFile(path);
  const { electionUniqueId } = ballotData;
  const bulletinBoardClient = new BulletinBoardClient(BULLETIN_BOARD_API_URL);
  const {
    createElectionMessage,
    endKeyCeremonyMessage,
  } = await bulletinBoardClient.getMessagesToAuditBallot(electionUniqueId);

  console.log(`${chalk.yellow("Verifying ballot...")}`);

  return Promise.all([
    verifyEncryptedDataHash(ballotData),
    verifyQuestionsAndAnswers(ballotData, createElectionMessage),
    verifyBallot(ballotData, createElectionMessage, endKeyCeremonyMessage),
  ]);
};
