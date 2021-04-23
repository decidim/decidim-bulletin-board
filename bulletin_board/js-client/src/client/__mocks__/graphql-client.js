import { Subject } from "rxjs";

const logEntriesByElection = {
  "election-1": {
    data: {
      election: {
        logEntries: [
          {
            signedData: "1234",
            contentHash: "h1234",
            chainedHash: "c1234",
          },
          {
            signedData: "5678",
            contentHash: "h5678",
            chainedHash: "c5678",
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
            chainedHash: "c9012",
          },
        ],
      },
    },
  },
};

const pendingMessageByMessageId = {
  "dummy.1": {
    data: {
      pendingMessage: {
        status: "accepted",
      },
    },
  },
  "dummy.2": {
    data: {
      pendingMessage: {
        status: "rejected",
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

  getPendingMessageByMessageId({ messageId }) {
    return Promise.resolve(
      pendingMessageByMessageId[messageId].data.pendingMessage
    );
  }

  processKeyCeremonyStep({ messageId, signedData }) {
    return Promise.resolve({
      messageId,
      signedData,
    });
  }

  processTallyStep({ messageId, signedData }) {
    return Promise.resolve({
      messageId,
      signedData,
    });
  }

  fakeElectionLogEntryUpdate(logEntry) {
    this.electionLogEntriesUpdates.next(logEntry);
  }
}
