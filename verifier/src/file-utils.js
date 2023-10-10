import { extname, join } from "path";
import os from "os";
import fs from "fs";
import tar from "tar-stream";
import CombinedStream from "combined-stream2";
import zlib from "zlib";
import streamJSON from "stream-json";
import streamValues from "stream-json/streamers/StreamValues.js";
import streamJSONL from "stream-json/jsonl/Parser.js";

/**
 * Whether the given file is an election log file or not.
 *
 * @param {String} path - the file path to be checked.
 * @returns {Boolean}
 */
export const isElectionLogFile = (path) => {
  return extname(path) === ".tar";
};

/**
 * Whether the given file is an audit ballot file or not.
 *
 * @param {String} path - the file path to be checked.
 * @returns {Boolean}
 */
export const isAuditBallotFile = (path) => {
  return extname(path) === ".txt";
};

/**
 * Extract the given tar file in a temporary directory and return
 * the path of that directory when it is done.
 *
 * @param {String} path - the file path to be extracted.
 * @param {String} prefix - a prefix used to create the temporary folder.
 * @returns {Promise<String>}
 */
export const extractElectionFile = async (path, prefix = "election-") => {
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
};

/**
 * Given a path that contains multiple jsonl.gz files it returns a combined stream
 * with all the data parsed.
 *
 * @param {String} path - a folder path that contains multiple files.
 *
 * @returns {Stream<Object>}
 */
export const createAllElectionFilesStream = (path) => {
  const combinedStream = CombinedStream.create();

  fs.readdirSync(path).forEach((filename) => {
    combinedStream.append(
      fs.createReadStream(join(path, filename)).pipe(zlib.createGunzip()),
    );
  });

  return combinedStream.pipe(streamJSONL.parser());
};

/**
 * This parses the ballot file and returns a new Object.
 *
 * @param {String} path - a path that contain a ballot file.
 *
 * @returns {Promise<Object>} - the content of the file as an Object with some extra properties.
 */
export const parseBallotFile = (path) => {
  let result = {};
  const stream = fs
    .createReadStream(path)
    .pipe(streamJSON.parser())
    .pipe(streamValues.streamValues());

  return new Promise((resolve) => {
    stream.on(
      "data",
      ({
        value: {
          encryptedData,
          encryptedDataHash,
          auditableData,
          plainVote,
          electionUniqueId,
        },
      }) => {
        result = {
          encryptedDataRaw: encryptedData,
          encryptedData: JSON.parse(encryptedData),
          encryptedDataHash,
          auditableData: JSON.parse(auditableData),
          plainVote,
          electionUniqueId,
        };
      },
    );

    stream.on("end", () => {
      resolve(result);
    });
  });
};
