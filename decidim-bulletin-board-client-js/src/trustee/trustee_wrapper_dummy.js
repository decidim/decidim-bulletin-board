export const CREATE_ELECTION = "create_election";
export const KEY_CEREMONY = "key_ceremony";
export const JOINT_ELECTION_KEY = "joint_election_key";

/**
 * This is just a dummy implementation of a possible `TrusteeWrapper`.
 * It is based on the dummy voting schema that we are using in the Bulletin Board.
 */
export class TrusteeWrapper {
  constructor({ trusteeId }) {
    this.trusteeId = trusteeId;
    this.status = CREATE_ELECTION;
    this.electionId = null;
    this.electionTrusteesCount = 0;
    this.processedMessages = [];
  }

  processMessage(logType, message) {
    switch (this.status) {
      case CREATE_ELECTION: {
        if (logType === CREATE_ELECTION) {
          this.status = KEY_CEREMONY;
          this.electionId = message.election_id;
          this.processedMessages = [];
          this.electionTrusteesCount = message.trustees.length;
          return {
            done: false,
            message: {
              iat: Math.round(+new Date() / 1000),
              type: this.status,
              election_id: this.electionId,
              election_public_key: 7,
              owner_id: this.trusteeId,
            },
          };
        }
        break;
      }
      case KEY_CEREMONY: {
        if (logType === KEY_CEREMONY && message.owner_id !== this.trusteeId) {
          this.processedMessages = [...this.processedMessages, message];
          if (
            this.processedMessages.length ===
            this.electionTrusteesCount - 1
          ) {
            this.status = JOINT_ELECTION_KEY;
            return {
              done: false,
              message: {},
            };
          }
        }
        break;
      }
      case JOINT_ELECTION_KEY: {
        if (logType === JOINT_ELECTION_KEY) {
          return {
            done: true,
            message,
          };
        }
        break;
      }
    }
  }
}
