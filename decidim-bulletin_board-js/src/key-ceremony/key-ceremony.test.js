import { tap } from "rxjs/operators";
import { Subject } from "rxjs";

import {
  KeyCeremony,
  MESSAGE_RECEIVED,
  MESSAGE_PROCESSED,
} from "./key-ceremony";

jest.mock("../trustee/trustee");

describe("KeyCeremony", () => {
  const electionLogEntriesUpdates = new Subject();

  const bulletinBoardClient = {
    getElectionLogEntries: jest.fn(() => Promise.resolve([])),
    subscribeToElectionLogEntriesUpdates: jest.fn((_args, fn) =>
      electionLogEntriesUpdates.pipe(tap(fn)).subscribe()
    ),
    processKeyCeremonyStep: jest.fn(),
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
      await keyCeremony.setup();
    });

    it("query all the log entries for the given election context", () => {
      expect(bulletinBoardClient.getElectionLogEntries).toHaveBeenCalledWith({
        electionUniqueId: electionContext.id,
      });
      expect(keyCeremony.electionLogEntries.length).toEqual(0);
    });

    it("subscribe to the log entries updates for the given election context and stores them", () => {
      expect(
        bulletinBoardClient.subscribeToElectionLogEntriesUpdates
      ).toHaveBeenCalledWith(
        { electionUniqueId: electionContext.id },
        expect.any(Function)
      );

      electionLogEntriesUpdates.next({ messageId: "foo", signedData: "1234" });
      electionLogEntriesUpdates.next({ messageId: "foo", signedData: "5678" });
      expect(keyCeremony.electionLogEntries.length).toEqual(2);
    });
  });

  describe("run", () => {
    beforeEach(async () => {
      await keyCeremony.setup();
    });

    it("processes messages until a save message, sending them in the next run call", async () => {
      electionLogEntriesUpdates.next({
        messageId: "dummy.send",
        signedData: "1234",
      });
      electionLogEntriesUpdates.next({
        messageId: "dummy.save",
        signedData: "5678",
      });
      electionLogEntriesUpdates.next({
        messageId: "dummy.done",
        signedData: "0912",
      });
      await keyCeremony.run();
      expect(bulletinBoardClient.processKeyCeremonyStep).toHaveBeenCalledWith({
        messageId: "dummy.send",
        signedData: "1234",
      });
      expect(
        bulletinBoardClient.processKeyCeremonyStep
      ).not.toHaveBeenCalledWith({
        messageId: "dummy.save",
        signedData: "5678",
      });
      await keyCeremony.run();
      expect(bulletinBoardClient.processKeyCeremonyStep).toHaveBeenCalledWith({
        messageId: "dummy.save",
        signedData: "5678",
      });
    });

    it("processes messages until a done message", async () => {
      electionLogEntriesUpdates.next({
        messageId: "dummy.nothing",
        signedData: "1234",
      });
      electionLogEntriesUpdates.next({
        messageId: "dummy.send",
        signedData: "5678",
      });
      electionLogEntriesUpdates.next({
        messageId: "dummy.done",
        signedData: "9012",
      });
      electionLogEntriesUpdates.next({
        messageId: "dummy.send",
        signedData: "1234",
      });
      await keyCeremony.run();
      expect(bulletinBoardClient.processKeyCeremonyStep).toHaveBeenCalledWith({
        messageId: "dummy.send",
        signedData: "5678",
      });
      expect(
        bulletinBoardClient.processKeyCeremonyStep
      ).not.toHaveBeenCalledWith({
        messageId: "dummy.send",
        signedData: "1234",
      });
    });

    it("skips the processed log entries that doesn't output a result", async () => {
      electionLogEntriesUpdates.next({
        messageId: "dummy.nothing",
        signedData: "1234",
      });
      electionLogEntriesUpdates.next({
        messageId: "dummy.send",
        signedData: "5678",
      });
      electionLogEntriesUpdates.next({
        messageId: "dummy.done",
        signedData: "9012",
      });
      await keyCeremony.run();
      expect(
        bulletinBoardClient.processKeyCeremonyStep
      ).not.toHaveBeenCalledWith({
        message_id: "dummy.nothing",
        content: "1234",
      });
      expect(
        bulletinBoardClient.processKeyCeremonyStep
      ).not.toHaveBeenCalledWith({
        message_id: "dummy.send",
        content: "5678",
      });
    });

    it("doesn't send a message already sent", async () => {
      electionLogEntriesUpdates.next({
        messageId: "dummy.send",
        signedData: "5678",
      });
      electionLogEntriesUpdates.next({
        messageId: "dummy.done",
        signedData: "9012",
      });
      await keyCeremony.run();
      expect(bulletinBoardClient.processKeyCeremonyStep).toHaveBeenCalledWith({
        messageId: "dummy.send",
        signedData: "5678",
      });
      electionLogEntriesUpdates.next({
        messageId: "dummy.send",
        signedData: "aaaa",
      });
      electionLogEntriesUpdates.next({
        messageId: "dummy.done",
        signedData: "bbbb",
      });
      await keyCeremony.run();
      expect(
        bulletinBoardClient.processKeyCeremonyStep
      ).not.toHaveBeenCalledWith({
        messageId: "dummy.send",
        signedData: "aaaa",
      });
    });

    it("reports all the events", async () => {
      let events = [];

      electionLogEntriesUpdates.next({
        messageId: "dummy.nothing",
        signedData: "1234",
      });
      electionLogEntriesUpdates.next({
        messageId: "dummy.send",
        signedData: "5678",
      });
      electionLogEntriesUpdates.next({
        messageId: "dummy.done",
        signedData: "9012",
      });

      keyCeremony.events.subscribe((event) => {
        events = [...events, event];
      });

      await keyCeremony.run();

      expect(events[0]).toEqual({
        type: MESSAGE_RECEIVED,
        message: {
          messageId: "dummy.nothing",
          signedData: "1234",
        },
      });
      expect(events[1]).toEqual({
        type: MESSAGE_PROCESSED,
        message: {
          messageId: "dummy.nothing",
          signedData: "1234",
        },
        result: null,
      });
      expect(events[2]).toEqual({
        type: MESSAGE_RECEIVED,
        message: {
          messageId: "dummy.send",
          signedData: "5678",
        },
      });
      expect(events[3]).toEqual({
        type: MESSAGE_PROCESSED,
        message: {
          messageId: "dummy.send",
          signedData: "5678",
        },
        result: {
          done: false,
          save: false,
          message: {
            message_id: "dummy.send",
            content: "5678",
          },
        },
      });

      expect(events[4]).toEqual({
        type: MESSAGE_RECEIVED,
        message: {
          messageId: "dummy.done",
          signedData: "9012",
        },
      });
      expect(events[5]).toEqual({
        type: MESSAGE_PROCESSED,
        message: {
          messageId: "dummy.done",
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
