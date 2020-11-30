import { Client } from "./client";

jest.mock("./graphql-client");

describe("Client", () => {
  const defaultParams = {
    apiEndpointUrl: "https://example.org/api",
    wsEndpointUrl: "wss://example.org/ws",
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

  describe("getElectionLogEntries", () => {
    it("returns all the log entries from the corresponding election", async () => {
      const entries = await client.getElectionLogEntries({
        electionUniqueId: "election-1",
      });
      expect(entries.length).toEqual(2);
    });
  });

  describe("subscribeToElectionLogEntriesUpdates", () => {
    it("calls the given callback function when a log entry is added", (done) => {
      const logEntryUpdate = {
        signedData: "some-signed-data",
      };
      client.subscribeToElectionLogEntriesUpdates(
        { electionUniqueId: "election-1" },
        (logEntry) => {
          expect(logEntry).toEqual(logEntryUpdate);
          done();
        }
      );
      client.apiClient.fakeElectionLogEntryUpdate(logEntryUpdate);
    });
  });

  describe("processKeyCeremonyStep", () => {
    it("calls the api client corresponding method with the correct arguments", async () => {
      const pendingMessage = await client.processKeyCeremonyStep({
        signedData: "1234",
      });
      expect(pendingMessage).toEqual({
        signedData: "1234",
      });
    });
  });
});
