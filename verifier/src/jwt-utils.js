/**
 * Helper functions to deal with JSON Web Tokens (JWT).
 *
 * @module
 */
module.exports = {
  /**
   * Decodes the JWT payload part without verifying it.
   *
   * @param {String} token - the JWT to be decoded.
   * @returns {String}
   */
  decodeJWT(token) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, "base64")
        .toString()
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return jsonPayload;
  },
};
