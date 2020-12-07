/**
 * Verify and parses JWT tokens.
 */
export class JWTParser {
  /**
   * Parses the given token only if it can be verified.
   *
   * @param {String} token - A JWT token.
   * @returns {Promise<Object>} - The payload included in the token.
   * @throws An error is thrown if the payload is not a valid JSON or the token
   *         cannot be verified.
   */
  async parse(token) {
    const verified = await this.verify(token);

    if (verified) {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    }

    throw new Error(`${token} is not valid.`);
  }

  /**
   * Verifies the token signature.
   *
   * @todo Needs real implementation.
   * @param {String} token - A JWT token.
   * @returns {Promise<Boolean>} - Whether the signature is valid or not.
   */
  verify(token) {
    return Promise.resolve(true);
  }
}
