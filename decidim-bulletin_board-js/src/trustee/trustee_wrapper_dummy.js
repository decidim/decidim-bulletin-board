import { MessageIdentifier, TRUSTEE_TYPE } from "../client/message-identifier";

export const CREATED = 0;
export const KEY_CEREMONY = 1;
export const KEY_CEREMONY_ENDED = 2;
export const TALLY = 3;
export const TALLY_ENDED = 4;

export const CREATE_ELECTION = "create_election";
export const START_KEY_CEREMONY = "start_key_ceremony";
export const KEY_CEREMONY_STEP_1 = "key_ceremony.step_1";
export const END_KEY_CEREMONY = "end_key_ceremony";
export const START_TALLY = "start_tally";
export const TALLY_CAST = "tally.cast";
export const TALLY_SHARE = "tally.share";
export const END_TALLY = "end_tally";

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
    this.status = CREATED;
    this.electionPublicKey = 0;
  }

  /**
   * Process the message and update the wrapper status.
   *
   * @returns {Object|undefined}
   */
  processMessage(messageId, message) {
    const messageIdentifier = MessageIdentifier.parse(messageId);
    switch (this.status) {
      case CREATED: {
        if (messageIdentifier.type === START_KEY_CEREMONY) {
          this.status = KEY_CEREMONY;
          this.electionId = messageIdentifier.electionId;
          this.electionPublicKey = Math.floor(50 + Math.random() * 200) * 2 + 1;

          return {
            message_id: MessageIdentifier.format(
              this.electionId,
              KEY_CEREMONY_STEP_1,
              TRUSTEE_TYPE,
              this.trusteeId
            ),
            content: JSON.stringify({
              election_public_key: this.electionPublicKey,
              owner_id: this.trusteeId,
            }),
          };
        }
        break;
      }
      case KEY_CEREMONY: {
        if (messageIdentifier.type === END_KEY_CEREMONY) {
          this.status = KEY_CEREMONY_ENDED;
        }
        break;
      }
      case KEY_CEREMONY_ENDED: {
        if (messageIdentifier.type === START_TALLY) {
          this.status = TALLY;
        }
        break;
      }
      case TALLY: {
        if (messageIdentifier.typeSubtype === TALLY_CAST) {
          const contests = JSON.parse(message.content);
          for (const [question, answers] of Object.entries(contests)) {
            for (const [answer, value] of Object.entries(answers)) {
              contests[question][answer] =
                (value % this.electionPublicKey) * this.electionPublicKey;
            }
          }

          return {
            message_id: MessageIdentifier.format(
              this.electionId,
              TALLY_SHARE,
              TRUSTEE_TYPE,
              this.trusteeId
            ),
            content: JSON.stringify({
              owner_id: this.trusteeId,
              contests,
            }),
          };
        } else if (messageIdentifier.type === END_TALLY) {
          this.status = TALLY_ENDED;
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
    return messageId && this.status === CREATED;
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
      console.warn("Restore not needed");
      return false;
    }

    const result = JSON.parse(state);
    if (result.trusteeId !== this.trusteeId) {
      console.warn("Invalid trustee id");
      return false;
    }

    if (messageId && result.status === CREATED) {
      console.warn("Invalid restored status");
      return false;
    }

    try {
      Object.assign(this, result);
    } catch (error) {
      console.error(error);
      return false;
    }

    return true;
  }

  /**
   * Whether the key ceremony process is done or not.
   * @returns {Boolean}
   */
  isKeyCeremonyDone() {
    return this.status >= KEY_CEREMONY_ENDED;
  }

  /**
   * Whether the tally process is done or not.
   * @returns {Boolean}
   */
  isTallyDone() {
    return this.status >= TALLY_ENDED;
  }
}
