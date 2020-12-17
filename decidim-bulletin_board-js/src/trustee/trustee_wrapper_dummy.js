import { MessageIdentifier, TRUSTEE_TYPE } from "../client/message-identifier";

export const CREATE_ELECTION = "create_election";
export const KEY_CEREMONY_STEP_1 = "key_ceremony.step_1";
export const KEY_CEREMONY_JOINT_ELECTION_KEY =
  "key_ceremony.joint_election_key";

/**
 * This is just a dummy implementation of a possible `TrusteeWrapper`.
 * It is based on the dummy voting schema that we are using in the Bulletin Board.
 */
export class TrusteeWrapper {
  constructor({ trusteeId }) {
    this.trusteeId = trusteeId;
    this.electionId = null;
    this.status = CREATE_ELECTION;
    this.electionTrusteesCount = 0;
    this.processedMessages = [];
  }

  backup() {
    return JSON.stringify(this);
  }

  checkRestoreNeeded(messageId) {
    return messageId && this.status === CREATE_ELECTION;
  }

  restore(state, messageId) {
    if (!this.checkRestoreNeeded(messageId)) {
      return false;
    }

    const result = JSON.parse(state);
    if (
      result.trusteeId !== this.trusteeId ||
      (messageId && result.status === CREATE_ELECTION)
    ) {
      return false;
    }

    try {
      Object.assign(this, result);
    } catch (error) {
      return false;
    }

    return true;
  }

  processMessage(messageId, message) {
    const messageIdentifier = MessageIdentifier.parse(messageId);
    switch (this.status) {
      case CREATE_ELECTION: {
        if (messageIdentifier.type === CREATE_ELECTION) {
          this.status = KEY_CEREMONY_STEP_1;
          this.electionId = messageIdentifier.electionId;
          this.processedMessages = [];
          this.electionTrusteesCount = message.trustees.length;
          return {
            done: false,
            save: true,
            message: {
              message_id: MessageIdentifier.format(
                this.electionId,
                KEY_CEREMONY_STEP_1,
                TRUSTEE_TYPE,
                this.trusteeId
              ),
              content: JSON.stringify({
                election_public_key: 7,
                owner_id: this.trusteeId,
              }),
            },
          };
        }
        break;
      }
      case KEY_CEREMONY_STEP_1: {
        if (messageIdentifier.typeSubtype === KEY_CEREMONY_STEP_1) {
          this.processedMessages = [...this.processedMessages, message];
          if (this.processedMessages.length === this.electionTrusteesCount) {
            this.status = KEY_CEREMONY_JOINT_ELECTION_KEY;
            return {
              done: false,
              save: false,
              message: null,
            };
          }
        }
        break;
      }
      case KEY_CEREMONY_JOINT_ELECTION_KEY: {
        if (messageIdentifier.typeSubtype === KEY_CEREMONY_JOINT_ELECTION_KEY) {
          return {
            done: true,
            save: false,
            message: null,
          };
        }
        break;
      }
    }
  }
}
