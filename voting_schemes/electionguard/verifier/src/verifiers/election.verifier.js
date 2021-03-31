const fs = require("fs");
const { exec } = require("child_process");
const { join } = require("path");
const os = require("os");
const chalk = require("chalk");
const jose = require("node-jose");

// Transformers
const { transform } = require("../transformers/message.transformer");

const ELECTIONGUARD_JAVA_JAR_PATH = join(
  __dirname,
  "..",
  "..",
  "electionguard-java",
  "build",
  "libs",
  "electionguard-java-0.9.1-SNAPSHOT-all.jar"
);

module.exports = {
  /**
   * Whether the election is valid or not.
   *
   * @param {String} allElectionFilesStream - a stream that outputs all the log entries of an election.
   * @returns {Promise<Boolean>}
   */
  verifyElection(allElectionFilesStream) {
    return new Promise((resolve) => {
      const targetPath = fs.mkdtempSync(join(os.tmpdir(), "electionguard-"));

      allElectionFilesStream.on("data", ({ value: data }) => {
        const { signed_data: signedData, message_id: messageId } = data;
        const decodedData = JSON.parse(
          jose.util.base64url.decode(signedData.split(".")[1])
        );
        const [message] = messageId.split("+");
        const [, , messageType, messageSubType] = message.split(".");

        transform(targetPath, messageType, messageSubType, decodedData);
      });

      allElectionFilesStream.on("end", () => {
        exec(
          `java -jar ${ELECTIONGUARD_JAVA_JAR_PATH} -in ${targetPath}`,
          (error, stdout, stderr) => {
            if (error) {
              console.log(`\t${chalk.red("[ERROR]")} Electionguard verified.`);
              console.error(error);
              resolve(false);
            }
            if (stderr) {
              console.log(`\t${chalk.red("[ERROR]")} Electionguard verified.`);
              console.error(stderr);
              resolve(false);
            }
            console.log(`\t${chalk.green("[OK]")} Electionguard verified.`);
            resolve(true);
          }
        );
      });

      allElectionFilesStream.on("error", (error) => {
        console.log(`\t${chalk.red("[ERROR]")} Electionguard verified.`);
        console.error(error);
        resolve(false);
      });
    });
  },
};
