import { Trustee } from "./trustee";
import { MESSAGE_RECEIVED, MESSAGE_PROCESSED } from "./event_manager";
import { buildMessageId } from "../test-utils";

jest.mock("./trustee_wrapper_dummy");
jest.mock("../jwt_parser");

describe("Trustee", () => {
  const election = {
    subscribeToLogEntriesChanges: jest.fn(),
    unsubscribeToLogEntriesChanges: jest.fn(),
    logEntries: [],
    getLastMessageFromTrustee: jest.fn(),
  };

  const bulletinBoardClient = {
    processKeyCeremonyStep: jest.fn((logEntry) => {
      election.logEntries = [...election.logEntries, logEntry];
    }),
    processTallyStep: jest.fn((logEntry) => {
      election.logEntries = [...election.logEntries, logEntry];
    }),
  };

  const identificationKeys = {
    sign: jest.fn().mockImplementation(({ content }) => content),
  };

  const defaultParams = {
    uniqueId: "trustee-1",
    bulletinBoardClient,
    identificationKeys,
    election,
    options: {
      waitUntilNextCheck: 0,
    },
  };

  const buildTrustee = (params = defaultParams) => {
    return new Trustee(params);
  };

  let trustee;

  beforeEach(() => {
    trustee = buildTrustee();
  });

  it("initialises the trustee with the given params", () => {
    expect(trustee.uniqueId).toEqual(defaultParams.uniqueId);
    expect(trustee.bulletinBoardClient).toEqual(
      defaultParams.bulletinBoardClient
    );
    expect(trustee.identificationKeys).toEqual(
      defaultParams.identificationKeys
    );
    expect(trustee.election).toEqual(defaultParams.election);
    expect(trustee.nextLogEntryIndexToProcess).toEqual(0);
    expect(trustee.lastMessageProcessedWithResult).toBeNull();
  });

  it("initialises the trustee wrapper with the given params", () => {
    expect(trustee.wrapper.trusteeId).toEqual(defaultParams.uniqueId);
  });

  describe("setup", () => {
    beforeEach(async () => {
      await trustee.setup();
    });

    it("uses the election object to subscribe to log entries changes", () => {
      expect(election.subscribeToLogEntriesChanges).toHaveBeenCalled();
    });
  });

  describe("tearDown", () => {
    beforeEach(() => {
      trustee.tearDown();
    });

    it("uses the election object to subscribe to log entries changes", () => {
      expect(election.unsubscribeToLogEntriesChanges).toHaveBeenCalled();
    });
  });

  describe("keyCeremony", () => {
    beforeEach(async () => {
      await trustee.setup();
      jest.spyOn(trustee, "tearDown");
    });

    describe("when the key ceremony has been setup", () => {
      beforeEach(async () => {
        election.logEntries = [
          {
            messageId: buildMessageId("dummy.save"),
            signedData: "5678",
          },
          {
            messageId: buildMessageId("dummy.send"),
            signedData: "1234",
          },
          {
            messageId: buildMessageId("dummy.nothing"),
            signedData: "1234",
          },
          {
            messageId: buildMessageId("dummy.done"),
            signedData: "0912",
          },
        ];

        const keyCeremonySetup = trustee.setupKeyCeremony();
        await keyCeremonySetup.next();
        await keyCeremonySetup.next();
        expect(bulletinBoardClient.processKeyCeremonyStep).toHaveBeenCalledWith(
          {
            messageId: buildMessageId("dummy.response_save"),
            signedData: "5678",
          }
        );
      });

      describe("when the trustee doesn't need to be restored", () => {
        beforeEach(() => {
          jest
            .spyOn(trustee, "needsToBeRestored")
            .mockImplementation(() => false);
        });

        afterEach(() => {
          expect(trustee.tearDown).toHaveBeenCalled();
        });

        it("processes messages until a done message", async () => {
          await trustee.runKeyCeremony();
          expect(
            bulletinBoardClient.processKeyCeremonyStep
          ).toHaveBeenCalledWith({
            messageId: buildMessageId("dummy.response_send"),
            signedData: "1234",
          });
        });

        it("skips the processed log entries that doesn't output a result", async () => {
          await trustee.runKeyCeremony();
          expect(
            bulletinBoardClient.processKeyCeremonyStep
          ).not.toHaveBeenCalledWith({
            message_id: buildMessageId("dummy.nothing"),
            content: "1234",
          });
        });

        it("doesn't send a message already sent", async () => {
          await trustee.runKeyCeremony();
          expect(
            bulletinBoardClient.processKeyCeremonyStep
          ).toHaveBeenCalledWith({
            messageId: buildMessageId("dummy.response_send"),
            signedData: "1234",
          });
          election.logEntries = [
            ...election.logEntries,
            {
              messageId: buildMessageId("dummy.send"),
              signedData: "aaaa",
            },
            {
              messageId: buildMessageId("dummy.done"),
              signedData: "bbbb",
            },
          ];
          await trustee.runKeyCeremony();
          expect(
            bulletinBoardClient.processKeyCeremonyStep
          ).not.toHaveBeenCalledWith({
            messageId: buildMessageId("dummy.response_send"),
            signedData: "aaaa",
          });
        });

        it("reports all the events", async () => {
          let events = [];

          trustee.events.subscribe((event) => {
            events = [...events, event];
          });

          await trustee.runKeyCeremony();

          expect(events[0]).toEqual({
            type: MESSAGE_RECEIVED,
            message: {
              messageId: buildMessageId("dummy.send"),
              signedData: "1234",
            },
          });

          expect(events[1]).toEqual({
            type: MESSAGE_PROCESSED,
            message: {
              messageId: buildMessageId("dummy.send"),
              signedData: "1234",
            },
            result: {
              message_id: buildMessageId("dummy.response_send"),
              content: "1234",
            },
          });

          expect(events[2]).toEqual({
            type: MESSAGE_RECEIVED,
            message: {
              messageId: buildMessageId("dummy.nothing"),
              signedData: "1234",
            },
          });

          expect(events[3]).toEqual({
            type: MESSAGE_PROCESSED,
            message: {
              messageId: buildMessageId("dummy.nothing"),
              signedData: "1234",
            },
          });

          expect(events[4]).toEqual({
            type: MESSAGE_RECEIVED,
            message: {
              messageId: buildMessageId("dummy.done"),
              signedData: "0912",
            },
          });

          expect(events[5]).toEqual({
            type: MESSAGE_PROCESSED,
            message: {
              messageId: buildMessageId("dummy.done"),
              signedData: "0912",
            },
          });
        });
      });

      describe("when the trustee needs to be restored", () => {
        beforeEach(() => {
          jest
            .spyOn(trustee, "needsToBeRestored")
            .mockImplementation(() => true);
        });

        it("throws an error", async () => {
          await expect(trustee.runKeyCeremony()).rejects.toThrow();
        });
      });
    });

    describe("when the key ceremony has not been setup", () => {
      it("throws an error", async () => {
        await expect(trustee.runKeyCeremony()).rejects.toThrow();
      });
    });
  });

  describe("runTally", () => {
    beforeEach(async () => {
      await trustee.setup();
      jest.spyOn(trustee, "tearDown");
    });

    describe("when the trustee doesn't need to be restored", () => {
      beforeEach(() => {
        jest
          .spyOn(trustee, "needsToBeRestored")
          .mockImplementation(() => false);
        jest.spyOn(trustee.wrapper, "processMessage");
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
        await trustee.runTally();
        expect(trustee.wrapper.processMessage).toHaveBeenCalledWith(
          buildMessageId("dummy.send"),
          "1234"
        );
        expect(trustee.wrapper.processMessage).toHaveBeenCalledWith(
          buildMessageId("dummy.send"),
          "5678"
        );
        expect(trustee.wrapper.processMessage).toHaveBeenCalledWith(
          buildMessageId("dummy.cast"),
          "0912"
        );
      });

      it("sends the result of processing the tally cast back to the bulletin board", async () => {
        election.logEntries = [
          {
            messageId: buildMessageId("dummy.cast"),
            signedData: "0912",
          },
        ];
        jest.spyOn(trustee.bulletinBoardClient, "processTallyStep");
        await trustee.runTally();
        expect(
          trustee.bulletinBoardClient.processTallyStep
        ).toHaveBeenCalledWith({
          messageId: buildMessageId("dummy.response_cast"),
          signedData: "0912",
        });
      });

      afterEach(() => {
        expect(trustee.tearDown).toHaveBeenCalled();
      });
    });

    describe("when the trustee needs to be restored", () => {
      beforeEach(() => {
        jest.spyOn(trustee, "needsToBeRestored").mockImplementation(() => true);
      });

      it("throws an error", async () => {
        await expect(trustee.runTally()).rejects.toThrow();
      });
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
