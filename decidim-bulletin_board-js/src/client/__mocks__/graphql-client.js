import { Subject } from "rxjs";

const logEntriesByElection = {
  "election-1": {
    data: {
      election: {
        logEntries: [
          {
            signedData: "1234",
            contentHash: "h1234",
          },
          {
            signedData: "5678",
            contentHash: "h5678",
          },
        ],
      },
    },
  },
  "election-2": {
    data: {
      election: {
        logEntries: [
          {
            signedData: "9012",
            contentHash: "h9012",
          },
        ],
      },
    },
  },
};

export class GraphQLClient {
  constructor({ apiEndpointUrl, wsEndpointUrl }) {
    this.apiEndpointUrl = apiEndpointUrl;
    this.wsEndpointUrl = wsEndpointUrl;
    this.electionLogEntriesUpdates = new Subject();
  }

  getLogEntry({ electionUniqueId, contentHash }) {
    return Promise.resolve(
      logEntriesByElection[electionUniqueId].data.election.logEntries.find(
        (logEntry) => {
          return logEntry.contentHash === contentHash;
        }
      )
    );
  }

  getElectionLogEntries({ electionUniqueId }) {
    return Promise.resolve(
      logEntriesByElection[electionUniqueId].data.election.logEntries
    );
  }

  subscribeToElectionLogEntriesUpdates() {
    return this.electionLogEntriesUpdates;
  }

  processKeyCeremonyStep({ signedData }) {
    return Promise.resolve({
      signedData,
    });
  }

  fakeElectionLogEntryUpdate(logEntry) {
    this.electionLogEntriesUpdates.next(logEntry);
  }
}
