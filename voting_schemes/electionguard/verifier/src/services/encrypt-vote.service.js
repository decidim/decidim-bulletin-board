import path, { resolve } from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { rejects } from "assert";

const PYTHON_SCRIPT_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "python-wrapper",
  "src",
  "encrypt-vote.py",
);

/**
 * Runs the python script to encrypt a vote and return its result as an Object.
 *
 * @returns {Promise<Object>}
 */
export const encryptVote = ({
  voterId,
  createElectionMessage,
  endKeyCeremonyMessage,
  plainVote,
  ballotStyle,
  nonce,
}) => {
  return new Promise((resolve) => {
    let pythonScriptResult = "";

    const pythonScript = spawn("python3", [
      PYTHON_SCRIPT_PATH,
      voterId,
      JSON.stringify(createElectionMessage),
      JSON.stringify(endKeyCeremonyMessage),
      JSON.stringify(plainVote),
      ballotStyle,
      nonce,
    ]);
    console.log(`\t${"Running python script to encrypt vote..."}`);
    // console.log(pythonScript.spawnargs.join(" "));

    pythonScript.stdout.on("data", function (data) {
      pythonScriptResult += data.toString();
    });

    pythonScript.stderr.on("data", function (error) {
      console.error(`\t${"Error running python script to encrypt vote..."}`);
      console.error(error.toString())
      rejects(error.toString());
    });

    pythonScript.stdout.on("close", function () {
      const { ciphered_ballot } = JSON.parse(pythonScriptResult.toString());
      resolve(ciphered_ballot);
    });
  });
};
