import { Election, WAIT_TIME_MS } from "./election";
import { MessageIdentifier, TRUSTEE_TYPE } from "../client/message-identifier";

describe("Election", () => {
  const bulletinBoardClient = {
    getElectionLogEntries: () => jest.fn(),
  };

  const defaultParams = {
    uniqueId: "1",
    bulletinBoardClient,
  };

  const buildElection = (params = defaultParams) => {
    return new Election(params);
  };

  let election;

  beforeEach(async () => {
    jest.useFakeTimers();
    election = buildElection();
    jest
      .spyOn(bulletinBoardClient, "getElectionLogEntries")
      .mockImplementation(() => Promise.resolve([2]));
  });

  afterEach(() => {
    election.unsubscribeToLogEntriesChanges();
    jest.clearAllMocks();
  });

  it("initializes the election with the correct params", () => {
    expect(election.bulletinBoardClient).toEqual(
      defaultParams.bulletinBoardClient
    );
    expect(election.uniqueId).toEqual(defaultParams.uniqueId);
    expect(election.logEntries).toEqual([]);
    expect(election.subscriptionId).toBeNull();
  });

  describe("subscribeToLogEntriesChanges", () => {
    beforeEach(async () => {
      election.logEntries = [1];
      election.subscribeToLogEntriesChanges();
    });

    describe("when the time has not passed", () => {
      it("gets the last log entries from the bulletin board", () => {
        expect(bulletinBoardClient.getElectionLogEntries).toHaveBeenCalledWith({
          electionUniqueId: defaultParams.uniqueId,
          after: null,
        });
        expect(election.logEntries).toEqual([1, 2]);
      });
    });

    describe("when the time has passed", () => {
      beforeEach(async () => {
        jest
          .spyOn(bulletinBoardClient, "getElectionLogEntries")
          .mockImplementation(() => Promise.resolve([3]));
        jest.advanceTimersByTime(WAIT_TIME_MS);
      });

      it("gets the last log entries from the bulletin board", () => {
        expect(bulletinBoardClient.getElectionLogEntries).toHaveBeenCalledWith({
          electionUniqueId: defaultParams.uniqueId,
          after: null,
        });
        expect(election.logEntries).toEqual([1, 2, 3]);
      });
    });
  });

  describe("unsubscribeToLogEntriesChanges", () => {
    beforeEach(async () => {
      election.subscribeToLogEntriesChanges();
      jest.clearAllMocks();
    });

    it("clears the interval so stops the log entries subscription", () => {
      election.unsubscribeToLogEntriesChanges();
      jest.advanceTimersByTime(WAIT_TIME_MS);
      expect(bulletinBoardClient.getElectionLogEntries).not.toHaveBeenCalled();
    });
  });

  describe("getLastMessageFromTrustee", () => {
    const trusteeId = "some-trustee";

    describe("when there are no messages from the trustee", () => {
      beforeEach(() => {
        election.logEntries = [
          {
            messageId: MessageIdentifier.format(
              election.uniqueId,
              "some-subtype",
              TRUSTEE_TYPE,
              "some-other-trustee"
            ),
            signedData: "5678",
          },
        ];
      });

      it("returns null", () => {
        expect(election.getLastMessageFromTrustee(trusteeId)).toEqual(null);
      });
    });

    describe("when there are messages from the trustee", () => {
      beforeEach(() => {
        election.logEntries = [
          {
            messageId: MessageIdentifier.format(
              election.uniqueId,
              "some-subtype",
              TRUSTEE_TYPE,
              trusteeId
            ),
            signedData: "1234",
          },
          {
            messageId: MessageIdentifier.format(
              election.uniqueId,
              "some-subtype",
              TRUSTEE_TYPE,
              trusteeId
            ),
            signedData: "5678",
          },
        ];
      });

      it("returns the last message send by the trustee", () => {
        expect(election.getLastMessageFromTrustee(trusteeId)).toEqual({
          messageId: "1.some-subtype+t.some-trustee",
          signedData: "5678",
        });
      });
    });
  });
});
