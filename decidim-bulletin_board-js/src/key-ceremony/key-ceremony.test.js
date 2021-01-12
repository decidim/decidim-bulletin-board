import {
  KeyCeremony,
  MESSAGE_RECEIVED,
  MESSAGE_PROCESSED,
} from "./key-ceremony";

import { buildMessageId } from "../test-utils";

jest.mock("../trustee/trustee");

describe("KeyCeremony", () => {
  const electionLogEntriesUpdates = [];

  const bulletinBoardClient = {
    getElectionLogEntries: jest.fn(() => {
      const result = [...electionLogEntriesUpdates];
      electionLogEntriesUpdates.length = 0;
      return Promise.resolve(result);
    }),
    processKeyCeremonyStep: jest.fn((logEntry) => {
      electionLogEntriesUpdates.push(logEntry);
    }),
  };

  const currentTrusteeContext = {
    id: "trustee-1",
    identificationKeys: {},
  };

  const electionContext = {
    id: "election-1",
    currentTrusteeContext,
  };

  const defaultParams = {
    bulletinBoardClient,
    electionContext,
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
    expect(keyCeremony.electionContext).toEqual(defaultParams.electionContext);
    expect(keyCeremony.options).toEqual(defaultParams.options);
  });

  describe("setup", () => {
    beforeEach(async () => {
      electionLogEntriesUpdates.push({ messageId: "foo", signedData: "5678" });
      await keyCeremony.setup();
    });

    it("query the first log entries for the given election context", () => {
      expect(bulletinBoardClient.getElectionLogEntries).toHaveBeenCalledWith({
        electionUniqueId: electionContext.id,
        after: null,
      });
      expect(keyCeremony.electionLogEntries.length).toEqual(1);
    });
  });

  describe("run", () => {
    beforeEach(async () => {
      await keyCeremony.setup();
    });

    it("processes messages until a save message, sending them in the next run call", async () => {
      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.send"),
        signedData: "1234",
      });
      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.save"),
        signedData: "5678",
      });
      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.done"),
        signedData: "0912",
      });
      await keyCeremony.run();
      expect(bulletinBoardClient.processKeyCeremonyStep).toHaveBeenCalledWith({
        messageId: buildMessageId("dummy.response_send"),
        signedData: "1234",
      });
      expect(
        bulletinBoardClient.processKeyCeremonyStep
      ).not.toHaveBeenCalledWith({
        messageId: buildMessageId("dummy.response_save"),
        signedData: "5678",
      });
      await keyCeremony.run();
      expect(bulletinBoardClient.processKeyCeremonyStep).toHaveBeenCalledWith({
        messageId: buildMessageId("dummy.response_save"),
        signedData: "5678",
      });
    });

    it("processes messages until a done message", async () => {
      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.nothing"),
        signedData: "1234",
      });
      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.send"),
        signedData: "5678",
      });
      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.done"),
        signedData: "9012",
      });
      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.send"),
        signedData: "1234",
      });
      await keyCeremony.run();
      expect(bulletinBoardClient.processKeyCeremonyStep).toHaveBeenCalledWith({
        messageId: buildMessageId("dummy.response_send"),
        signedData: "5678",
      });
      expect(
        bulletinBoardClient.processKeyCeremonyStep
      ).not.toHaveBeenCalledWith({
        messageId: buildMessageId("dummy.response_send"),
        signedData: "1234",
      });
    });

    it("skips the processed log entries that doesn't output a result", async () => {
      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.nothing"),
        signedData: "1234",
      });
      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.send"),
        signedData: "5678",
      });
      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.done"),
        signedData: "9012",
      });
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
      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.send"),
        signedData: "5678",
      });
      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.save"),
        signedData: "9012",
      });
      await keyCeremony.run();
      expect(bulletinBoardClient.processKeyCeremonyStep).toHaveBeenCalledWith({
        messageId: buildMessageId("dummy.response_send"),
        signedData: "5678",
      });
      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.send"),
        signedData: "aaaa",
      });
      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.done"),
        signedData: "bbbb",
      });
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

      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.nothing"),
        signedData: "1234",
      });
      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.send"),
        signedData: "5678",
      });
      electionLogEntriesUpdates.push({
        messageId: buildMessageId("dummy.done"),
        signedData: "9012",
      });

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
});
