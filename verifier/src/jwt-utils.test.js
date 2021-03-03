const { decodeJWT } = require("./jwt-utils");

describe("JWT utils", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIifQ.UIZchxQD36xuhacrJF9HQ5SIUxH5HBiv9noESAacsxU";

  describe("decodeJWT", () => {
    it("returns the payload part as a string", () => {
      const payload = decodeJWT(token);
      expect(JSON.parse(payload)).toEqual({ foo: "bar" });
    });
  });
});
