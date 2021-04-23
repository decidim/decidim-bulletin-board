/**
 * @jest-environment jsdom
 */

import { GraphQLClient } from "./graphql-client";

beforeEach(() => {
  fetch.resetMocks();
});

describe("GraphQLClient", () => {
  let client;

  beforeEach(() => {
    client = new GraphQLClient({
      apiEndpointUrl: "https://example.org/api",
    });
  });

  describe("getLogEntry", () => {
    it("returns the log entry given a election id and a content hash", async () => {
      const logEntryResult = { messageId: "dummy.1", signedData: "1234" };

      fetch.mockResponseOnce(
        JSON.stringify({ data: { logEntry: logEntryResult } })
      );

      const logEntry = await client.getLogEntry({
        electionUniqueId: "example.1",
        contentHash: "1234",
      });

      expect(logEntry).toEqual(logEntryResult);
    });

    it("throws an error if something went wrong", async () => {
      fetch.mockReject(() => Promise.reject(new Error("something went wrong")));

      await expect(
        client.getLogEntry({
          electionUniqueId: "example.1",
          contentHash: "1234",
        })
      ).rejects.toThrow("something went wrong");
    });
  });

  describe("getElectionLogEntries", () => {
    it("returns all the log entries given a election id", async () => {
      const logEntriesResult = [
        { messageId: "dummy.1", signedData: "1234", chainedHash: "c1234" },
        { messageId: "dummy.2", signedData: "5678", chainedHash: "c5678" },
      ];

      fetch.mockResponseOnce(
        JSON.stringify({ data: { election: { logEntries: logEntriesResult } } })
      );

      const logEntries = await client.getElectionLogEntries({
        electionUniqueId: "example.1",
      });

      expect(logEntries).toEqual(logEntriesResult);
    });

    it("throws an error if something went wrong", async () => {
      fetch.mockReject(() => Promise.reject(new Error("something went wrong")));

      await expect(
        client.getElectionLogEntries({
          electionUniqueId: "example.1",
        })
      ).rejects.toThrow("something went wrong");
    });
  });

  describe("getPendingMessageByMessageId", () => {
    it("returns the pending message given a messageId", async () => {
      const pendingMessageResult = { status: "accepted" };

      fetch.mockResponseOnce(
        JSON.stringify({ data: { pendingMessage: pendingMessageResult } })
      );

      const pendingMessage = await client.getPendingMessageByMessageId({
        messageId: "dummy.1",
      });

      expect(pendingMessage).toEqual(pendingMessageResult);
    });

    it("throws an error if something went wrong", async () => {
      fetch.mockReject(() => Promise.reject(new Error("something went wrong")));

      await expect(
        client.getPendingMessageByMessageId({
          messageId: "dummy.1",
        })
      ).rejects.toThrow("something went wrong");
    });
  });

  describe("sendKeyCeremonyMessage", () => {
    it("returns the pending message created if everything went ok", async () => {
      const pendingMessageResult = { signedData: "1234" };

      fetch.mockResponseOnce(
        JSON.stringify({
          data: {
            processKeyCeremonyStep: { pendingMessage: pendingMessageResult },
          },
        })
      );

      const pendingMessage = await client.processKeyCeremonyStep({
        electionUniqueId: "example.1",
      });

      expect(pendingMessage).toEqual(pendingMessageResult);
    });

    it("throws an error if the response include an error message", async () => {
      const errorMessage = "message cannot be processed";

      fetch.mockResponseOnce(
        JSON.stringify({
          data: {
            processKeyCeremonyStep: { error: errorMessage },
          },
        })
      );

      await expect(
        client.processKeyCeremonyStep({
          electionUniqueId: "example.1",
        })
      ).rejects.toThrow(errorMessage);
    });

    it("throws an error if something went wrong", async () => {
      fetch.mockReject(() => Promise.reject(new Error("something went wrong")));

      await expect(
        client.processKeyCeremonyStep({
          electionUniqueId: "example.1",
        })
      ).rejects.toThrow("something went wrong");
    });
  });
});
