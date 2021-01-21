import {
  KeyCeremony,
  MESSAGE_RECEIVED,
  MESSAGE_PROCESSED,
} from "./key-ceremony";
import { Trustee } from "../trustee/trustee";

import { buildMessageId } from "../test-utils";

jest.mock("../trustee/trustee");

describe("KeyCeremony", () => {
  const election = {
    subscribeToLogEntriesChanges: jest.fn(),
    unsubscribeToLogEntriesChanges: jest.fn(),
    logEntries: [],
  };

  const bulletinBoardClient = {
    processKeyCeremonyStep: jest.fn((logEntry) => {
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

  const buildKeyCeremony = (params = defaultParams) => {
    return new KeyCeremony(params);
  };

  let keyCeremony;

  beforeEach(async () => {
    keyCeremony = buildKeyCeremony();
  });

  it("initialize the ceremony with the correct params", () => {
    expect(keyCeremony.bulletinBoardClient).toEqual(
      defaultParams.bulletinBoardClient
    );
    expect(keyCeremony.election).toEqual(defaultParams.election);
    expect(keyCeremony.trustee).toEqual(defaultParams.trustee);
    expect(keyCeremony.options).toEqual(defaultParams.options);
    expect(keyCeremony.response).toBeNull();
    expect(keyCeremony.nextLogEntryIndexToProcess).toEqual(0);
  });

  describe("setup", () => {
    beforeEach(() => {
      keyCeremony.setup();
    });

    it("uses the election object to subscribe to log entries changes", () => {
      expect(election.subscribeToLogEntriesChanges).toHaveBeenCalled();
    });
  });

  describe("tearDown", () => {
    beforeEach(() => {
      keyCeremony.tearDown();
    });

    it("uses the election object to subscribe to log entries changes", () => {
      expect(election.unsubscribeToLogEntriesChanges).toHaveBeenCalled();
    });
  });

  describe("run", () => {
    beforeEach(() => {
      keyCeremony.setup();
      jest.spyOn(keyCeremony, "tearDown");
    });

    describe("when the trustee doesn't need to be restored", () => {
      beforeEach(() => {
        jest
          .spyOn(trustee, "needsToBeRestored")
          .mockImplementation(() => false);
      });

      afterEach(() => {
        expect(keyCeremony.tearDown).toHaveBeenCalled();
      });

      it("processes messages until a save message, sending them in the next run call", async () => {
        election.logEntries = [
          {
            messageId: buildMessageId("dummy.send"),
            signedData: "1234",
          },
          {
            messageId: buildMessageId("dummy.save"),
            signedData: "5678",
          },
          {
            messageId: buildMessageId("dummy.done"),
            signedData: "0912",
          },
        ];
        await keyCeremony.run();
        expect(bulletinBoardClient.processKeyCeremonyStep).toHaveBeenCalledWith(
          {
            messageId: buildMessageId("dummy.response_send"),
            signedData: "1234",
          }
        );
        expect(
          bulletinBoardClient.processKeyCeremonyStep
        ).not.toHaveBeenCalledWith({
          messageId: buildMessageId("dummy.response_save"),
          signedData: "5678",
        });
        await keyCeremony.run();
        expect(bulletinBoardClient.processKeyCeremonyStep).toHaveBeenCalledWith(
          {
            messageId: buildMessageId("dummy.response_save"),
            signedData: "5678",
          }
        );
      });

      it("processes messages until a done message", async () => {
        election.logEntries = [
          {
            messageId: buildMessageId("dummy.nothing"),
            signedData: "1234",
          },
          {
            messageId: buildMessageId("dummy.send"),
            signedData: "5678",
          },
          {
            messageId: buildMessageId("dummy.done"),
            signedData: "9012",
          },
          {
            messageId: buildMessageId("dummy.send"),
            signedData: "1234",
          },
        ];
        await keyCeremony.run();
        expect(bulletinBoardClient.processKeyCeremonyStep).toHaveBeenCalledWith(
          {
            messageId: buildMessageId("dummy.response_send"),
            signedData: "5678",
          }
        );
        expect(
          bulletinBoardClient.processKeyCeremonyStep
        ).not.toHaveBeenCalledWith({
          messageId: buildMessageId("dummy.response_send"),
          signedData: "1234",
        });
      });

      it("skips the processed log entries that doesn't output a result", async () => {
        election.logEntries = [
          {
            messageId: buildMessageId("dummy.nothing"),
            signedData: "1234",
          },
          {
            messageId: buildMessageId("dummy.send"),
            signedData: "5678",
          },
          {
            messageId: buildMessageId("dummy.done"),
            signedData: "9012",
          },
        ];
        await keyCeremony.run();
        expect(
          bulletinBoardClient.processKeyCeremonyStep
        ).not.toHaveBeenCalledWith({
          message_id: buildMessageId("dummy.nothing"),
          content: "1234",
        });
        expect(
          bulletinBoardClient.processKeyCeremonyStep
        ).not.toHaveBeenCalledWith({
          message_id: buildMessageId("dummy.response_send"),
          content: "5678",
        });
      });

      it("doesn't send a message already sent", async () => {
        election.logEntries = [
          {
            messageId: buildMessageId("dummy.send"),
            signedData: "5678",
          },
          {
            messageId: buildMessageId("dummy.save"),
            signedData: "9012",
          },
        ];
        await keyCeremony.run();
        expect(bulletinBoardClient.processKeyCeremonyStep).toHaveBeenCalledWith(
          {
            messageId: buildMessageId("dummy.response_send"),
            signedData: "5678",
          }
        );
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
        await keyCeremony.run();
        expect(
          bulletinBoardClient.processKeyCeremonyStep
        ).not.toHaveBeenCalledWith({
          messageId: buildMessageId("dummy.response_send"),
          signedData: "aaaa",
        });
      });

      it("reports all the events", async () => {
        let events = [];

        election.logEntries = [
          {
            messageId: buildMessageId("dummy.nothing"),
            signedData: "1234",
          },
          {
            messageId: buildMessageId("dummy.send"),
            signedData: "5678",
          },
          {
            messageId: buildMessageId("dummy.done"),
            signedData: "9012",
          },
        ];

        keyCeremony.events.subscribe((event) => {
          events = [...events, event];
        });

        await keyCeremony.run();

        expect(events[0]).toEqual({
          type: MESSAGE_RECEIVED,
          message: {
            messageId: buildMessageId("dummy.nothing"),
            signedData: "1234",
          },
        });
        expect(events[1]).toEqual({
          type: MESSAGE_PROCESSED,
          message: {
            messageId: buildMessageId("dummy.nothing"),
            signedData: "1234",
          },
          result: null,
        });
        expect(events[2]).toEqual({
          type: MESSAGE_RECEIVED,
          message: {
            messageId: buildMessageId("dummy.send"),
            signedData: "5678",
          },
        });
        expect(events[3]).toEqual({
          type: MESSAGE_PROCESSED,
          message: {
            messageId: buildMessageId("dummy.send"),
            signedData: "5678",
          },
          result: {
            done: false,
            save: false,
            message: {
              message_id: buildMessageId("dummy.response_send"),
              content: "5678",
            },
          },
        });

        expect(events[4]).toEqual({
          type: MESSAGE_RECEIVED,
          message: {
            messageId: buildMessageId("dummy.done"),
            signedData: "9012",
          },
        });
        expect(events[5]).toEqual({
          type: MESSAGE_PROCESSED,
          message: {
            messageId: buildMessageId("dummy.done"),
            signedData: "9012",
          },
          result: {
            save: false,
            done: true,
            message: null,
          },
        });
      });
    });

    describe("when the trustee needs to be restored", () => {
      beforeEach(() => {
        jest.spyOn(trustee, "needsToBeRestored").mockImplementation(() => true);
      });

      it("throws an error", async () => {
        await expect(keyCeremony.run()).rejects.toThrow();
      });
    });
  });
});
