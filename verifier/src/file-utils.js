const { extname } = require("path");

module.exports = {
  isElectionLogFile(path) {
    return extname(path) === ".tar";
  },
  isAuditBallotFile(path) {
    return extname(path) === ".txt";
  },
};
