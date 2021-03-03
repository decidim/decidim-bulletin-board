const { hash } = require("./crypto-utils");

describe("Crypto utils", () => {
  describe("hash", () => {
    it("returns the sha256 digest of a string", () => {
      expect(hash("foo")).toEqual(
        "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae"
      );
    });
  });
});
