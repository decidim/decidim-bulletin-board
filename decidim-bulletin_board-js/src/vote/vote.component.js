import { Client } from "../client/client";
import { Election } from "../election/election";
import { Voter } from "../voter/voter";

/**
 * This class is used to bind any UI elements to a vote process.
 */
export class VoteComponent {
  /**
   * Initialises the class with the given params.
   * @param {Object} params - An object that contains the initialization params.
   *  - {Object} bulletinBoardClientParams - An object to configure the bulletin board client.
   *  - {String} electionUniqueId - The unique identifier of an election.
   *  - {String} voterUniqueId - The unique identifier of a voter.
   * @constructor
   */
  constructor({ bulletinBoardClientParams, electionUniqueId, voterUniqueId }) {
    this.bulletinBoardClient = new Client(bulletinBoardClientParams);

    const election = new Election({
      uniqueId: electionUniqueId,
      bulletinBoardClient: this.bulletinBoardClient,
    });

    this.voter = new Voter({
      uniqueId: voterUniqueId,
      bulletinBoardClient: this.bulletinBoardClient,
      election,
    });
  }

  /**
   * Bind UI events to the vote process.
   *
   * @method bindEvents
   * @param {Object} eventCallbacks - An object that contains event callback functions.
   * - {Function} onSetup - a function that is called when the voter is set up.
   * - {Function} onBindStartButton - a function that receives a callback function that will be called when
   *                                  the vote must be started.
   * - {Function} onStart - a function that is called when the vote has started.
   * - {Function} onVoteValidation - a function that is called to validate the vote before encrypting it.
   * - {Function} onVoteEncrypted - a function that is called when the vote has been encrypted.
   * - {Function} onComplete - a function that is called when the vote is done.
   * - {Function} onInvalid - a function that is called when the vote is not valid.
   *
   * @returns {Promise<undefined>}
   */
  async bindEvents({
    onSetup,
    onBindStartButton,
    onStart,
    onVoteValidation,
    onVoteEncrypted,
    onComplete,
    onInvalid,
  }) {
    onBindStartButton(() => {
      onStart();

      onVoteValidation(
        (plainVote) => {
          this.voter
            .encrypt(plainVote)
            .then(async (encryptedVote) => {
              onVoteEncrypted(encryptedVote);
            })
            .then(() => {
              onComplete();
            });
        },
        () => {
          onInvalid();
        }
      );
    });

    await this.voter.setup();
    onSetup();
  }
}
