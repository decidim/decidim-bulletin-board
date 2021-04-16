import chalk from "chalk";

// Services
import { encryptVote } from "../services/encrypt-vote.service.js";

// Transformers
import { transform } from "../transformers/ballot.transformer.js";

/**
 *
 * @param {Object} ballotData - the ballot data parsed from the file.
 * @param {Object} createElectionMessage - the create election message in the election log entries.
 * @param {Object} endKeyCeremonyMessage - the end key ceremony message in the election log entries.
 * @returns {Promise<Boolean>}
 */
export const verifyBallot = async (
  ballotData,
  createElectionMessage,
  endKeyCeremonyMessage
) => {
  const {
    expectedCipheredBallot,
    voterId,
    plainVote,
    ballotStyle,
    nonce,
  } = transform(ballotData);

  const actualCipheredBallot = await encryptVote({
    voterId,
    createElectionMessage,
    endKeyCeremonyMessage,
    plainVote,
    ballotStyle,
    nonce,
  });

  return new Promise((resolve) => {
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
