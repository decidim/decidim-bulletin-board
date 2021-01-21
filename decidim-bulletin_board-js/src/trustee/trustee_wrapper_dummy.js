import { MessageIdentifier, TRUSTEE_TYPE } from "../client/message-identifier";

export const CREATE_ELECTION = "create_election";
export const KEY_CEREMONY_STEP_1 = "key_ceremony.step_1";
export const KEY_CEREMONY_JOINT_ELECTION_KEY =
  "key_ceremony.joint_election_key";
export const TALLY_CAST = "tally.cast";
export const TALLY_SHARE = "tally.share";

/**
 * This is just a dummy implementation of a possible `TrusteeWrapper`.
 * It is based on the dummy voting schema that we are using in the Bulletin Board.
 */
export class TrusteeWrapper {
  /**
   * Initializes the class with the given params.
   *
   * @constructor
   * @param {Object} params - An object that contains the initialization params.
   * - {String} trusteeId - The unique id of a trustee.
   */
  constructor({ trusteeId }) {
    this.trusteeId = trusteeId;
    this.electionId = null;
    this.status = CREATE_ELECTION;
    this.electionTrusteesCount = 0;
    this.processedMessages = [];
  }

  /**
   * Process the message and update the wrapper status.
   *
   * @returns {Object|undefined}
   */
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
            cast: false,
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
              cast: false,
              save: false,
              message: null,
            };
          }
        }
        break;
      }
      case KEY_CEREMONY_JOINT_ELECTION_KEY: {
        if (messageIdentifier.typeSubtype === KEY_CEREMONY_JOINT_ELECTION_KEY) {
          this.status = TALLY_CAST;
          return {
            done: true,
            cast: false,
            save: false,
            message: null,
          };
        }
        break;
      }
      case TALLY_CAST: {
        if (messageIdentifier.typeSubtype === TALLY_CAST) {
          this.status = TALLY_SHARE;
          return {
            done: true,
            cast: true,
            save: false,
            message: {
              message_id: MessageIdentifier.format(
                this.electionId,
                TALLY_SHARE,
                TRUSTEE_TYPE,
                this.trusteeId
              ),
              content: JSON.stringify({
                owner_id: this.trusteeId,
              }),
            },
          };
        }
        break;
      }
    }
  }

  /**
   * Whether the trustee wrapper state needs to be restored or not.
   *
   * @param {String} messageId - The unique identifier of a message.
   * @returns {boolean}
   */
  needsToBeRestored(messageId) {
    return messageId && this.status === CREATE_ELECTION;
  }

  /**
   * Returns the wrapper state in a string format.
   *
   * @returns {String}
   */
  backup() {
    return JSON.stringify(this);
  }

  /**
   * Restore the trustee state from the given state string. It uses the last message sent to check that the state is valid.
   *
   * @param {string} state - As string with the wrapper state retrieved from the backup method.
   * @param {messageId} messageId - The unique id of the last message sent by the trustee.
   * @returns {boolean}
   */
  restore(state, messageId) {
    if (!this.needsToBeRestored(messageId)) {
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
}
