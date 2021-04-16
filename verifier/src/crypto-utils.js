import crypto from "crypto";

/**
 * Computes the sha256 of the given data.
 *
 * @param {String} data - The string to be digested.
 * @returns {String}
 */
export const hash = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};
