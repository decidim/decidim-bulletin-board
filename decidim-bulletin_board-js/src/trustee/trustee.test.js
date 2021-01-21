import { Trustee } from "./trustee";

jest.mock("./trustee_wrapper_dummy");
jest.mock("./jwt_parser");

describe("Trustee", () => {
  const identificationKeys = {
    sign: jest.fn(),
  };

  const election = {
    getLastMessageFromTrustee: jest.fn(),
  };

  const defaultParams = {
    id: "trustee-1",
    identificationKeys,
    election,
  };

  const buildTrustee = (params = defaultParams) => {
    return new Trustee(params);
  };

  let trustee;

  beforeEach(() => {
    trustee = buildTrustee();
  });

  it("initialise the trustee with the given params", () => {
    expect(trustee.id).toEqual(defaultParams.id);
    expect(trustee.identificationKeys).toEqual(
      defaultParams.identificationKeys
    );
    expect(trustee.election).toEqual(defaultParams.election);
  });

  it("initialise the trustee wrapper with the given params", () => {
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

  describe("needsToBeRestored", () => {
    describe("when the election log has a message that needs to be restored", () => {
      beforeEach(() => {
        jest
          .spyOn(election, "getLastMessageFromTrustee")
          .mockImplementation(() => ({ messageId: "some-id" }));

        jest
          .spyOn(trustee.wrapper, "needsToBeRestored")
          .mockImplementation(() => true);
      });

      it("returns true", () => {
        expect(trustee.needsToBeRestored()).toBeTruthy();
        expect(trustee.wrapper.needsToBeRestored).toHaveBeenCalledWith(
          "some-id"
        );
      });
    });

    describe("when the election log doesn't have a message that needs to be restored", () => {
      beforeEach(() => {
        jest
          .spyOn(election, "getLastMessageFromTrustee")
          .mockImplementation(() => null);

        jest
          .spyOn(trustee.wrapper, "needsToBeRestored")
          .mockImplementation(() => false);
      });

      it("returns false", () => {
        expect(trustee.needsToBeRestored()).toBeFalsy();
        expect(trustee.wrapper.needsToBeRestored).not.toHaveBeenCalled();
      });
    });
  });

  describe("backup", () => {
    it("returns the state of the wrapper", () => {
      jest.spyOn(trustee.wrapper, "backup");
      trustee.backup();
      expect(trustee.wrapper.backup).toHaveBeenCalled();
    });
  });

  describe("restore", () => {
    describe("when the restore is not needed", () => {
      beforeEach(() => {
        jest
          .spyOn(trustee, "needsToBeRestored")
          .mockImplementation(() => false);
      });

      it("returns false", () => {
        expect(trustee.restore("some state")).toBeFalsy();
      });
    });

    it("fetch the last message from the trustee and restore the wrapper state", () => {
      jest
        .spyOn(election, "getLastMessageFromTrustee")
        .mockImplementation(() => ({ messageId: "some-id" }));
      jest.spyOn(trustee.wrapper, "restore");

      trustee.restore("some state");
      expect(trustee.wrapper.restore).toHaveBeenCalledWith(
        "some state",
        "some-id"
      );
    });
  });
});
