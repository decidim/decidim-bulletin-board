import { Tally } from "./tally";
import { Trustee } from "../trustee/trustee";

jest.mock("../trustee/trustee");

describe("Tally", () => {
  const election = {
    subscribeToLogEntriesChanges: jest.fn(),
    unsubscribeToLogEntriesChanges: jest.fn(),
    logEntries: [],
  };

  const bulletinBoardClient = {};

  const trustee = new Trustee();

  const defaultParams = {
    bulletinBoardClient,
    election,
    trustee,
  };

  const buildTally = (params = defaultParams) => {
    return new Tally(params);
  };

  let tally;

  beforeEach(async () => {
    tally = buildTally();
  });

  it("initialize the tally with the correct params", () => {
    expect(tally.bulletinBoardClient).toEqual(
      defaultParams.bulletinBoardClient
    );
    expect(tally.election).toEqual(defaultParams.election);
    expect(tally.trustee).toEqual(defaultParams.trustee);
  });

  describe("setup", () => {
    beforeEach(async () => {
      await tally.setup();
    });

    it("uses the election object to subscribe to log entries changes", () => {
      expect(election.subscribeToLogEntriesChanges).toHaveBeenCalled();
    });
  });

  describe("tearDown", () => {
    beforeEach(() => {
      tally.tearDown();
    });

    it("uses the election object to subscribe to log entries changes", () => {
      expect(election.unsubscribeToLogEntriesChanges).toHaveBeenCalled();
    });
  });

  describe("run", () => {
    beforeEach(async () => {
      await tally.setup();
      jest.spyOn(tally, "tearDown");
    });

    describe("when the trustee doesn't need to be restored", () => {
      beforeEach(() => {
        jest
          .spyOn(trustee, "needsToBeRestored")
          .mockImplementation(() => false);
      });

      afterEach(() => {
        expect(tally.tearDown).toHaveBeenCalled();
      });
    });

    describe("when the trustee needs to be restored", () => {
      beforeEach(() => {
        jest.spyOn(trustee, "needsToBeRestored").mockImplementation(() => true);
      });

      it("throws an error", async () => {
        await expect(tally.run()).rejects.toThrow();
      });
    });
  });
});
