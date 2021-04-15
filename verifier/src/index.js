import * as fs from "fs";
import { isElectionLogFile, isAuditBallotFile } from "./file-utils.js";
import { verify as electionVerify } from "./election/index.js";
import { verify as ballotVerify } from "./ballot/index.js";

if (process.argv.length < 3) {
  console.log("usage: verify <filename>");
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
