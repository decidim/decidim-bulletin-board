import fs from "fs";
import { exec } from "child_process";
import { join, dirname } from "path";
import os from "os";
import { fileURLToPath } from "url";
import chalk from "chalk";
import jose from "node-jose";

// Transformers
import { transform } from "../transformers/message.transformer.js";

const ELECTIONGUARD_JAVA_JAR_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "electionguard-java",
  "build",
  "libs",
  "electionguard-java-0.9.2-SNAPSHOT-all.jar",
);

/**
 * Whether the election is valid or not.
 *
 * @param {String} allElectionFilesStream - a stream that outputs all the log entries of an election.
 * @returns {Promise<Boolean>}
 */
export const verifyElection = (allElectionFilesStream) => {
  return new Promise((resolve) => {
    const targetPath = fs.mkdtempSync(join(os.tmpdir(), "electionguard-"));

    allElectionFilesStream.on("data", ({ value: data }) => {
      const { signed_data: signedData, message_id: messageId } = data;
      const decodedData = JSON.parse(
        jose.util.base64url.decode(signedData.split(".")[1]),
      );
      // console.log("decodedData", decodedData);

      const [message] = messageId.split("+");
      const [, , messageType, messageSubType] = message.split(".");

      transform(targetPath, messageType, messageSubType, decodedData);
    });

    allElectionFilesStream.on("end", () => {
      exec(
        `java -jar ${ELECTIONGUARD_JAVA_JAR_PATH} -in ${targetPath}`,
        (error, stdout, stderr) => {
          console.log(stdout)
          if (error) {
            console.log(`\t${chalk.red("[ERROR]")} Electionguard verified.`);
            console.error(error);
            console.error(stderr);
            resolve(false);
          } else if (stderr) {
            console.log(`\t${chalk.red("[ERROR]")} Electionguard verified.`);
            console.error(stderr);
            resolve(false);
          } else {
            console.log(`\t${chalk.green("[OK]")} Electionguard verified.`);
            resolve(true);
          }
        },
      );
    });

    allElectionFilesStream.on("error", (error) => {
      console.log(`\t${chalk.red("[ERROR]")} Electionguard verified.`);
      console.error(error);
      resolve(false);
    });
  });
};
