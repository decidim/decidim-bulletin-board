import { Client } from "../client/client";
import { Election } from "../election/election";
import { Trustee } from "../trustee/trustee";

/**
 * This class is used to bind any UI elements to a tally process.
 */
export class TallyComponent {
  /**
   * Initialises the class with the given params.
   * @param {Object} params - An object that contains the initialization params.
   *  - {Object} bulletinBoardClientParams - An object to configure the bulletin board client.
   *  - {String} authorityPublicKeyJSON - The authority identification public key.
   *  - {String} electionUniqueId - The unique identifier of an election.
   *  - {String} trusteeUniqueId - The unique identifier of a trustee.
   *  - {Object} trusteeIdentificationKeys - An object that contains both the public and private key for
   *                                         the corresponding trustee.
   *  - {Object} trusteeWrapperAdapter - An object to interact with the trustee wrapper.
   * @constructor
   */
  constructor({
    bulletinBoardClientParams,
    authorityPublicKeyJSON,
    electionUniqueId,
    trusteeUniqueId,
    trusteeIdentificationKeys,
    trusteeWrapperAdapter,
  }) {
    const bulletinBoardClient = new Client(bulletinBoardClientParams);

    this.election = new Election({
      uniqueId: electionUniqueId,
      bulletinBoardClient,
      typesFilter: [
        "create_election",
        "start_key_ceremony",
        "key_ceremony",
        "end_key_ceremony",
        "start_tally",
        "tally",
        "end_tally",
      ],
    });

    this.trustee = new Trustee({
      uniqueId: trusteeUniqueId,
      bulletinBoardClient,
      authorityPublicKeyJSON,
      identificationKeys: trusteeIdentificationKeys,
      election: this.election,
      wrapperAdapter: trusteeWrapperAdapter,
    });
  }

  /**
   * Bind UI events to the key ceremony process.
   *
   * @method bindEvents
   * @param {Object} eventCallbacks - An object that contains event callback functions.
   * - {Function} onSetup - a function that is called when the trustee is set up.
   * - {Function} onEvent - a function that is called when an event is emitted from the trustee.
   * - {Function} onBindRestoreButton - a function that receives a callback function that will be called when
   *                                    the restore process must be started.
   * - {Function} onBindStartButton - a function that receives a callback function that will be called when
   *                                  the key ceremony must be started.
   * - {Function} onRestore - a function that is called when the trustee is restored.
   * - {Function} onComplete - a function that is called when the key ceremony is done.
   * - {Function} onStart - a function that is called when the key ceremony has started.
   * - {Function} onTrusteeNeedsToBeRestored - a function that is called when the trustee must be restored.
   *
   * @returns {Promise<undefined>}
   */
  async bindEvents({
    onSetup,
    onEvent,
    onBindRestoreButton,
    onBindStartButton,
    onRestore,
    onComplete,
    onStart,
    onTrusteeNeedsToBeRestored,
  }) {
    this.trustee.events.subscribe(onEvent);

    onBindStartButton(async (event) => {
      event.preventDefault();

      onStart();

      if (await this.trustee.needsToBeRestored()) {
        onTrusteeNeedsToBeRestored();
      } else {
        await this.trustee.runTally();
        onComplete();
      }
    });

    onBindRestoreButton((event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = async ({ target }) => {
        const content = target.result;
        if (await this.trustee.restore(content)) {
          onRestore();
          await this.trustee.runTally();
          onComplete();
        }
      };
      reader.readAsText(file);
    });

    await this.trustee.setup();
    onSetup();
  }
}
