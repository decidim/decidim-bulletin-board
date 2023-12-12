import * as fs from "fs";
import { isElectionLogFile, isAuditBallotFile } from "./file-utils.js";
import { verify as electionVerify } from "./election/index.js";
import { verify as ballotVerify } from "./ballot/index.js";

if (process.argv.length < 3 || process.argv[2] === "-h" || process.argv[2] === "--help") {
  console.log("usage: verify <filename> BULLETIN_BOARD_API_URL");
  console.log("");
  console.log("Alternavely, you can skip the third argument and specify the ENV var BULLETIN_BOARD_API_URL with the URL of the bulletin board API.");
  console.log("");
  console.log("Examples:");
  console.log("node src/index.js election-2021-02-14T20:00:00Z.log http://localhost:8000/api");
  process.exit(1);
}

const path = process.argv[2];

fs.access(path, fs.F_OK, async (error) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  if (isElectionLogFile(path)) {
    await electionVerify(path);
    process.exit(0);
  } else if (isAuditBallotFile(path)) {
    await ballotVerify(path);
    process.exit(0);
  } else {
    console.error(`File ${path} not supported.`);
    process.exit(1);
  }
});
