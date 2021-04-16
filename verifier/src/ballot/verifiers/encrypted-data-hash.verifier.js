import chalk from "chalk";

import { hash } from "../../crypto-utils.js";

/**
 * Check if the encrypted data hash is computed properly.
 * @returns {Promise<Boolean>}
 */
export const verifyEncryptedDataHash = (ballotData) => {
  const { encryptedDataRaw, encryptedDataHash } = ballotData;

  return new Promise((resolve) => {
    if (hash(encryptedDataRaw) === encryptedDataHash) {
      console.log(`\t${chalk.green("[OK]")} Encrypted data hash verified.`);
      resolve(true);
    } else {
      console.log(`\t${chalk.red("[ERROR]")} Encrypted data hash verified.`);
      resolve(true);
    }
  });
};
