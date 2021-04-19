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
   *  - {String} authorityPublicKeyJSON - The authority identification public key.
   *  - {String} trusteeUniqueId - The unique identifier of a trustee.
   *  - {Object} trusteeIdentificationKeys - An object that contains both the public and private key for
   *                                         the corresponding trustee.
   *  - {Object} trusteeWrapperAdapter - An object to interact with the trustee wrapper.
   * @constructor
   */
  constructor({
    authorityPublicKeyJSON,
    trusteeUniqueId,
    trusteeIdentificationKeys,
    trusteeWrapperAdapter,
  }) {
    this.trustee = new Trustee({
      uniqueId: trusteeUniqueId,
      authorityPublicKeyJSON,
      identificationKeys: trusteeIdentificationKeys,
      wrapperAdapter: trusteeWrapperAdapter,
    });
  }

  /**
   * Setup the election for the trustee.
   *
   * @param {Object} params - An object that contains the initialization params.
   *  - {Object} bulletinBoardClientParams - An object to configure the bulletin board client.
   *  - {String} electionUniqueId - The unique identifier of an election.
   *
   * @returns {Promise<undefined>}
   */
  async setupElection({ bulletinBoardClientParams, electionUniqueId }) {
    const [authorityId] = electionUniqueId.split(".");
    const trusteeUniqueIdHeader = `${authorityId}.${this.trustee.uniqueId}`;
    const authorizationHeader = await this.trustee.signMessage({
      trustee_unique_id: trusteeUniqueIdHeader,
    });

    const bulletinBoardClient = new Client({
      ...bulletinBoardClientParams,
      headers: {
        Authorization: authorizationHeader,
        TrusteeUniqueId: trusteeUniqueIdHeader,
      },
    });

    const election = new Election({
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

    this.trustee.election = election;
  }

  /**
   * Bind UI events to the key ceremony process.
   *
   * @method bindEvents
   * @param {Object} eventCallbacks - An object that contains event callback functions.
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
    onEvent,
    onBindRestoreButton,
    onBindStartButton,
    onRestore,
    onComplete,
    onStart,
    onTrusteeNeedsToBeRestored,
  }) {
    const onSetupDone = this.trustee.setup();

    this.trustee.events.subscribe(onEvent);

    onBindStartButton(async (event) => {
      onStart();
      event.preventDefault();

      await onSetupDone;

      if (await this.trustee.needsToBeRestored()) {
        onTrusteeNeedsToBeRestored();
      } else {
        await this.trustee.runTally();
        onComplete();
      }
    });

    onBindRestoreButton(async (event) => {
      await onSetupDone;
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
  }
}
