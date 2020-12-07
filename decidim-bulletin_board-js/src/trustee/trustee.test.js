import { Trustee } from "./trustee";

jest.mock("./trustee_wrapper_dummy");
jest.mock("./jwt_parser");

describe("Trustee", () => {
  const identificationKeys = {
    sign: jest.fn(),
  };

  const defaultParams = {
    id: "trustee-1",
    identificationKeys,
  };

  const buildTrustee = (params = defaultParams) => {
    return new Trustee(params);
  };

  let trustee;

  beforeEach(() => {
    trustee = buildTrustee();
  });

  it("initialise the trustee wrapper with the given params", () => {
    expect(trustee.id).toEqual(defaultParams.id);
    expect(trustee.wrapper.trusteeId).toEqual(defaultParams.id);
  });

  describe("processLogEntry", () => {
    it("calls the wrapper's process message method with the parsed data", async () => {
      spyOn(trustee.wrapper, "processMessage");
      await trustee.processLogEntry({
        messageId: "dummy",
        signedData: "1234",
      });
      expect(trustee.wrapper.processMessage).toHaveBeenCalledWith(
        "dummy",
        "1234 parsed"
      );
    });
  });

  describe("sign", () => {
    it("delegates to the provided `identificationKeys` object", () => {
      trustee.sign({ foo: "bar" });
      expect(identificationKeys.sign).toHaveBeenCalledWith({ foo: "bar" });
    });
  });
});
