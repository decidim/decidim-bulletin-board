import { Tally } from "./tally";
import { Trustee } from "../trustee/trustee";

import { buildMessageId } from "../test-utils";

jest.mock("../trustee/trustee");

describe("Tally", () => {
  const election = {
    subscribeToLogEntriesChanges: jest.fn(),
    unsubscribeToLogEntriesChanges: jest.fn(),
    logEntries: [],
  };

  const bulletinBoardClient = {
    processTallyStep: jest.fn((logEntry) => {
      election.logEntries = [...election.logEntries, logEntry];
    }),
  };

  const trustee = new Trustee();

  const defaultParams = {
    bulletinBoardClient,
    election,
    trustee,
    options: {
      bulletinBoardWaitTime: 0,
    },
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

      it("processes all the log entries in the election using the given trustee until the tally cast", async () => {
        election.logEntries = [
          {
            messageId: buildMessageId("dummy.send"),
            signedData: "1234",
          },
          {
            messageId: buildMessageId("dummy.send"),
            signedData: "5678",
          },
          {
            messageId: buildMessageId("dummy.cast"),
            signedData: "0912",
          },
        ];
        jest.spyOn(trustee, "processLogEntry");
        await tally.run();
        expect(trustee.processLogEntry).toHaveBeenCalledWith({
          messageId: buildMessageId("dummy.send"),
          signedData: "1234",
        });
        expect(trustee.processLogEntry).toHaveBeenCalledWith({
          messageId: buildMessageId("dummy.send"),
          signedData: "5678",
        });
        expect(trustee.processLogEntry).toHaveBeenCalledWith({
          messageId: buildMessageId("dummy.cast"),
          signedData: "0912",
        });
      });

      it("sends the result of processing the tally cast back to the bulletin board", async () => {
        election.logEntries = [
          {
            messageId: buildMessageId("dummy.cast"),
            signedData: "0912",
          },
        ];
        jest.spyOn(tally.bulletinBoardClient, "processTallyStep");
        await tally.run();
        expect(tally.bulletinBoardClient.processTallyStep).toHaveBeenCalledWith(
          {
            messageId: buildMessageId("dummy.response_cast"),
            signedData: "0912",
          }
        );
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
