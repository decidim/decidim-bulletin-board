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
   *  - {String} authorityPublicKeyJSON - The authority identification public key.
   *  - {String} electionUniqueId - The unique identifier of an election.
   *  - {String} voterUniqueId - The unique identifier of a voter.
   * @constructor
   */
  constructor({
    bulletinBoardClientParams,
    authorityPublicKeyJSON,
    electionUniqueId,
    voterUniqueId,
  }) {
    this.bulletinBoardClient = new Client(bulletinBoardClientParams);

    const election = new Election({
      uniqueId: electionUniqueId,
      bulletinBoardClient: this.bulletinBoardClient,
    });

    this.voter = new Voter({
      bulletinBoardClient: this.bulletinBoardClient,
      authorityPublicKeyJSON,
      election,
      uniqueId: voterUniqueId,
    });
  }

  /**
   * Bind UI events to the vote process.
   *
   * @method bindEvents
   * @param {Object} eventCallbacks - An object that contains event callback functions.
   * - {Function} onSetup - a function that is called when the voter is set up.
   * - {Function} onBindEncryptButton - a function that receives a callback function that will be called when encrypting the vote must be started
   * - {Function} onVoteEncryption - a function that is called when the vote gets encrypted
   * - {Function} castOrAuditBallot - a function that is called to cast or audit a ballot
   * - {Function} onStart - a function that is called when the vote has started.
   * - {Function} onAuditVote - a function that is called to audit a vote before encrypting it.
   * - {Function} onVoteAudition - a function that is called when the auditable vote is ready.
   * - {Function} onAuditComplete - a function that is called when the auditable vote is audited.
   * - {Function} onVoteValidation - a function that is called to validate the vote before encrypting it.
   * - {Function} onVoteEncrypted - a function that is called when the vote has been encrypted.
   * - {Function} onComplete - a function that is called when the vote is done.
   * - {Function} onInvalid - a function that is called when the vote is not valid.
   *
   * @returns {Promise<undefined>}
   */
  async bindEvents({
    onSetup,
    onBindEncryptButton,
    onStart,
    onVoteEncryption,
    castOrAuditBallot,
    onAuditVote,
    onVoteAudition,
    onAuditComplete,
    onVoteValidation,
    onVoteEncrypted,
    onComplete,
    onInvalid,
  }) {
    onBindEncryptButton(() => {
      onStart();

      onVoteEncryption((plainVote) => {
        this.voter.encrypt(plainVote).then((encryptedVote) => {
          castOrAuditBallot();

          onAuditVote(
            () => {
              this.voter
                .auditBallot(encryptedVote)
                .then((auditedVote) => {
                  onVoteAudition(
                    auditedVote,
                    `${this.voter.uniqueId}-election-${this.voter.election.uniqueId}.txt`
                  );
                })
                .then(() => {
                  onAuditComplete();
                });
            },
            () => {
              onInvalid();
            }
          );

          onVoteValidation(
            () => {
              this.voter
                .encryptBallot(encryptedVote)
                .then(async (encryptedBallot) => {
                  onVoteEncrypted(encryptedBallot);
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
      });
    });

    await this.voter.setup();
    onSetup();
  }
}
