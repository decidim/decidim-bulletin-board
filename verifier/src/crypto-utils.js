const crypto = require("crypto");

/**
 * Helper functions to deal with cryptography operations.
 *
 * @module
 */
module.exports = {
  /**
   * Computes the sha256 of the given data.
   *
   * @param {String} data - The string to be digested.
   * @returns {String}
   */
  hash(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
  },
};
