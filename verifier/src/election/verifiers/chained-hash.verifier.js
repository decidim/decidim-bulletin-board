import chalk from "chalk";

import { hash } from "../../crypto-utils.js";

export const verifyChainedHashes = (allElectionFilesStream) => {
  let previousHash = null;

  return new Promise((resolve, fail) => {
    allElectionFilesStream.on("data", ({ value: data }) => {
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
    });

    allElectionFilesStream.on("end", () => {
      console.log(`\t${chalk.green("[OK]")} Chained hashes verified.`);
      resolve(true);
    });

    allElectionFilesStream.on("error", (error) => {
      console.log(`\t${chalk.red("[ERROR]")} Chained hashes verified.`);
      console.error(error);
      resolve(false);
    });
  });
};
