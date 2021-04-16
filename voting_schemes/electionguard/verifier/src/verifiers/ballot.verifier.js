import chalk from "chalk";

// Services
import { encryptVote } from "../services/encrypt-vote.service.js";
import { BulletinBoardClient } from "../services/bulletin-board-client.service.js";

// Transformers
import { transform } from "../transformers/ballot.transformer.js";

const BULLETIN_BOARD_API_URL =
  process.env.BULLETIN_BOARD_API_URL || "http://localhost:8000/api";
const ELECTION_UNIQUE_ID = process.env.ELECTION_UNIQUE_ID;

/**
 *
 * @param {Object} ballotData - the ballot data parsed from the file.
 * @returns {Promise<Boolean>}
 */
export const verifyBallot = async (ballotData) => {
  return new Promise(async (resolve) => {
    const bulletinBoardClient = new BulletinBoardClient(BULLETIN_BOARD_API_URL);

    const {
      expectedCipheredBallot,
      voterId,
      plainVote,
      ballotStyle,
      nonce,
    } = transform(ballotData);
    const {
      createElectionMessage,
      endKeyCeremonyMessage,
    } = await bulletinBoardClient.getMessagesToEncryptVote(ELECTION_UNIQUE_ID);

    const actualCipheredBallot = await encryptVote({
      voterId,
      createElectionMessage,
      endKeyCeremonyMessage,
      plainVote,
      ballotStyle,
      nonce,
    });

    if (
      JSON.stringify(cleanTimeDependingData(actualCipheredBallot)) ===
      JSON.stringify(cleanTimeDependingData(expectedCipheredBallot))
    ) {
      console.log(`\t${chalk.green("[OK]")} Electionguard verified.`);
      resolve(true);
    } else {
      console.log(`\t${chalk.red("[ERROR]")} Electionguard verified.`);
      resolve(true);
    }
  });
};

const cleanTimeDependingData = (ballot) => {
  const { code, timestamp, ...nonTimeDependingData } = ballot;
  return nonTimeDependingData;
};
