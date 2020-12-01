import { tap } from "rxjs/operators";
import { Subject } from "rxjs";

import { KeyCeremony } from "./key-ceremony";

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

      electionLogEntriesUpdates.next({ logType: "foo", signedData: "1234" });
      electionLogEntriesUpdates.next({ logType: "foo", signedData: "5678" });
      expect(keyCeremony.electionLogEntries.length).toEqual(2);
    });
  });

  describe("run", () => {
    beforeEach(async () => {
      await keyCeremony.setup();
    });

    it("always processes the first log entry", async () => {
      electionLogEntriesUpdates.next({
        logType: "dummy.done",
        signedData: "1234",
      });
      const result = await keyCeremony.run();
      expect(bulletinBoardClient.processKeyCeremonyStep).toHaveBeenCalledWith({
        signedData: "1234",
      });
      expect(result).toEqual({
        signedData: "1234",
      });
    });

    it("processes all messages until done", async () => {
      electionLogEntriesUpdates.next({
        logType: "dummy.step",
        signedData: "1234",
      });
      electionLogEntriesUpdates.next({
        logType: "dummy.done",
        signedData: "5678",
      });
      const result = await keyCeremony.run();
      expect(bulletinBoardClient.processKeyCeremonyStep).toHaveBeenCalledWith({
        signedData: "1234",
      });
      expect(bulletinBoardClient.processKeyCeremonyStep).toHaveBeenCalledWith({
        signedData: "5678",
      });
      expect(result).toEqual({
        signedData: "5678",
      });
    });

    it("skips the processed log entries that doesn't output a result", async () => {
      electionLogEntriesUpdates.next({
        logType: "dummy.nothing",
        signedData: "1234",
      });
      electionLogEntriesUpdates.next({
        logType: "dummy.done",
        signedData: "5678",
      });
      const result = await keyCeremony.run();
      expect(
        bulletinBoardClient.processKeyCeremonyStep
      ).not.toHaveBeenCalledWith({
        signedData: "1234",
      });
      expect(result).toEqual({
        signedData: "5678",
      });
    });
  });
});
