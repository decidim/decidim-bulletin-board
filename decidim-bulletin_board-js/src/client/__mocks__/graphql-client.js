import { Subject } from "rxjs";

const logEntriesByElection = {
  "election-1": {
    data: {
      election: {
        logEntries: [
          {
            signedData: "1234",
          },
          {
            signedData: "5678",
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

  getElectionLogEntries({ electionId }) {
    return Promise.resolve(
      logEntriesByElection[electionId].data.election.logEntries
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
