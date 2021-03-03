const path = require("path");
const fs = require("fs");

const { isElectionLogFile, isAuditBallotFile } = require("./file-utils");

describe("file utils", () => {
  const auditableElectionPath = path.join(
    __dirname,
    "..",
    "test",
    "fixtures",
    "election-ok.tar"
  );
  const auditableBallotPath = path.join(
    __dirname,
    "..",
    "test",
    "fixtures",
    "ballot-1.txt"
  );

  beforeEach(() => {
    expect(fs.existsSync(auditableElectionPath)).toBeTruthy();
    expect(fs.existsSync(auditableBallotPath)).toBeTruthy();
  });

  describe("isElectionLogFile", () => {
    it("returns true when the file is the exported log entries file", () => {
      expect(isElectionLogFile(auditableElectionPath)).toBeTruthy();
    });

    it("otherwise it returns false", () => {
      expect(isElectionLogFile(auditableBallotPath)).toBeFalsy();
    });
  });

  describe("isAuditBallotFile", () => {
    it("returns true when the file is the auditable ballot file", () => {
      expect(isAuditBallotFile(auditableBallotPath)).toBeTruthy();
    });

    it("otherwise it returns false", () => {
      expect(isAuditBallotFile(auditableElectionPath)).toBeFalsy();
    });
  });
});
