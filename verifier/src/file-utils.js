const { extname, join } = require("path");
const os = require("os");
const fs = require("fs");
const tar = require("tar-stream");
const CombinedStream = require("combined-stream2");
const zlib = require("zlib");

const { parser: jsonlParser } = require("stream-json/jsonl/Parser");

/**
 * Helper functions to read and parse different file formats to verify both
 * an election and a ballot.
 *
 * @module
 */
module.exports = {
  /**
   * Whether the given file is an election log file or not.
   *
   * @param {String} path - the file path to be checked.
   * @returns {Boolean}
   */
  isElectionLogFile(path) {
    return extname(path) === ".tar";
  },
  /**
   * Whether the given file is an audit ballot file or not.
   *
   * @param {String} path - the file path to be checked.
   * @returns {Boolean}
   */
  isAuditBallotFile(path) {
    return extname(path) === ".txt";
  },
  /**
   * Extract the given tar file in a temporary directory and return
   * the path of that directory when it is done.
   *
   * @param {String} path - the file path to be extracted.
   * @param {String} prefix - a prefix used to create the temporary folder.
   * @returns {Promise<String>}
   */
  async extractElectionFile(path, prefix = "election-") {
    const targetPath = fs.mkdtempSync(join(os.tmpdir(), prefix));
    return new Promise((resolve) => {
      const extract = tar.extract(targetPath);
      extract.on("entry", (header, stream, next) => {
        stream.pipe(fs.createWriteStream(join(targetPath, header.name)));
        next();
      });
      fs.createReadStream(path).pipe(extract);
      extract.on("finish", function () {
        resolve(targetPath);
      });
    });
  },
  /**
   * Given a path that contains multiple jsonl.gz files it returns a combined stream
   * with all the data parsed.
   *
   * @param {String} path - a folder path that contains multiple files.
   * @param {Function} onData - called when there is new data in the stream.
   * @param {Function} onSuccess - called when all the data has been processed.
   * @param {Function} onError - called when something went wrong.
   *
   * @returns {Stream<Object>}
   */
  readAllElectionFiles(path, onData, onSuccess, onError) {
    const combinedStream = CombinedStream.create();

    fs.readdirSync(path).forEach((filename) => {
      combinedStream.append(
        fs.createReadStream(join(path, filename)).pipe(zlib.createGunzip())
      );
    });

    combinedStream.pipe(jsonlParser()).on("data", ({ value }) =>
      // The `onData` callback also receives a function to abort the stream
      onData(value, combinedStream.destroy.bind(combinedStream))
    );
    combinedStream.on("end", onSuccess);
    combinedStream.on("error", onError);

    return combinedStream;
  },
};
