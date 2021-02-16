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
    this.status = CREATED;
    this.electionPublicKey = 0;
  }

  /**
   * Process the message and update the wrapper status.
   *
   * @param {String} messageType - The message type.
   * @param {Object} decodedData - An object with the data to process.
   *
   * @returns {Object|undefined}
   */
  processMessage(messageType, decodedData) {
    switch (this.status) {
      case CREATED: {
        if (messageType === START_KEY_CEREMONY) {
          this.status = KEY_CEREMONY;
          this.electionPublicKey = Math.floor(50 + Math.random() * 200) * 2 + 1;

          return {
            messageType: KEY_CEREMONY_STEP_1,
            content: JSON.stringify({
              election_public_key: this.electionPublicKey,
              owner_id: this.trusteeId,
            }),
          };
        }
        break;
      }
      case KEY_CEREMONY: {
        if (messageType === END_KEY_CEREMONY) {
          this.status = KEY_CEREMONY_ENDED;
        }
        break;
      }
      case KEY_CEREMONY_ENDED: {
        if (messageType === START_TALLY) {
          this.status = TALLY;
        }
        break;
      }
      case TALLY: {
        if (messageType === TALLY_CAST) {
          const contests = JSON.parse(decodedData.content);
          for (const [question, answers] of Object.entries(contests)) {
            for (const [answer, value] of Object.entries(answers)) {
              contests[question][answer] =
                (value % this.electionPublicKey) * this.electionPublicKey;
            }
          }

          return {
            messageType: TALLY_SHARE,
            content: JSON.stringify({
              owner_id: this.trusteeId,
              contests,
            }),
          };
        } else if (messageType === END_TALLY) {
          this.status = TALLY_ENDED;
        }
        break;
      }
    }
  }

  /**
   * Whether the trustee wrapper is in a fresh state or no.
   *
   * @returns {boolean}
   */
  isFresh() {
    return this.status === CREATED;
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
   * Restore the trustee state from the given state string.
   *
   * @param {string} state - As string with the wrapper state retrieved from the backup method.
   * @returns {boolean}
   */
  restore(state) {
    if (!this.isFresh()) {
      console.warn("Restore not needed");
      return false;
    }

    const result = JSON.parse(state);
    if (result.trusteeId !== this.trusteeId) {
      console.warn("Invalid trustee id");
      return false;
    }

    if (result.status === CREATED) {
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
