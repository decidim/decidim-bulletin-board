import { Client } from "./client";

jest.mock("./graphql-client");

describe("Client", () => {
  const defaultParams = {
    apiEndpointUrl: "https://example.org/api",
  };

  const buildClient = (params = defaultParams) => {
    return new Client(params);
  };

  let client;

  beforeEach(() => {
    client = buildClient();
  });

  it("initialise the api client with the given params", () => {
    expect(client.apiClient.apiEndpointUrl).toEqual(
      defaultParams.apiEndpointUrl
    );
    expect(client.apiClient.wsEndpointUrl).toEqual(defaultParams.wsEndpointUrl);
  });

  describe("getLogEntry", () => {
    it("returns the log entry for the given hash", async () => {
      const entry = await client.getLogEntry({
        electionUniqueId: "election-1",
        contentHash: "h1234",
      });
      expect(entry).toEqual({
        signedData: "1234",
        contentHash: "h1234",
        chainedHash: "c1234",
      });
    });
  });

  describe("getElectionLogEntries", () => {
    it("returns all the log entries from the corresponding election", async () => {
      const entries = await client.getElectionLogEntries({
        electionUniqueId: "election-1",
      });
      expect(entries.length).toEqual(2);
    });
  });

  describe("waitForPendingMessageToBeProcessed", () => {
    it("returns the pending message for the given messageId", async () => {
      const pendingMessage = await client.waitForPendingMessageToBeProcessed(
        "dummy.1"
      );
      expect(pendingMessage).toEqual({
        status: "accepted",
      });
    });
  });

  describe("processKeyCeremonyStep", () => {
    it("calls the api client corresponding method with the correct arguments", async () => {
      const pendingMessage = await client.processKeyCeremonyStep({
        messageId: "key-ceremony-step",
        signedData: "1234",
      });
      expect(pendingMessage).toEqual({
        messageId: "key-ceremony-step",
        signedData: "1234",
      });
    });
  });

  describe("processTallyStep", () => {
    it("calls the api client corresponding method with the correct arguments", async () => {
      const pendingMessage = await client.processTallyStep({
        messageId: "tally-step",
        signedData: "1234",
      });
      expect(pendingMessage).toEqual({
        messageId: "tally-step",
        signedData: "1234",
      });
    });
  });
});
