import { Client } from "../client/client";
import { Election } from "../election/election";
import { Trustee } from "../trustee/trustee";

/**
 * This class is used to bind any UI elements to a key ceremony process.
 */
export class KeyCeremonyComponent {
  /**
   * Initialises the class with the given params.
   * @param {Object} params - An object that contains the initialization params.
   *  - {Object} bulletinBoardClientParams - An object to configure the bulletin board client.
   *  - {String} electionUniqueId - The unique identifier of an election.
   *  - {String} trusteeUniqueId - The unique identifier of a trustee.
   *  - {Object} trusteeIdentificationKeys - An object that contains both the public and private key for
   *                                         the corresponding trustee.
   * @constructor
   */
  constructor({
    bulletinBoardClientParams,
    electionUniqueId,
    trusteeUniqueId,
    trusteeIdentificationKeys,
  }) {
    const bulletinBoardClient = new Client(bulletinBoardClientParams);

    this.election = new Election({
      uniqueId: electionUniqueId,
      bulletinBoardClient,
    });

    this.trustee = new Trustee({
      uniqueId: trusteeUniqueId,
      bulletinBoardClient,
      identificationKeys: trusteeIdentificationKeys,
      election: this.election,
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
   * - {Function} onBackupNeeded - a function that is called when the trustee backup is required.
   * - {Function} onBindBackupButton - a function that receives a callback function that will be called when
   *                                   the trustee backup must be started.
   * - {Function} onBackupStarted - a function that is called when the backup has started.
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
    onBackupNeeded,
    onBindBackupButton,
    onBackupStarted,
  }) {
    this.trustee.events.subscribe(onEvent);

    onBindRestoreButton((event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = async ({ target }) => {
        const content = target.result;
        if (this.trustee.restore(content)) {
          onRestore();
          await this.trustee.runKeyCeremony();
          onComplete();
        }
      };
      reader.readAsText(file);
    });

    onBindStartButton(async (event) => {
      event.preventDefault();

      onStart();

      if (this.trustee.needsToBeRestored()) {
        onTrusteeNeedsToBeRestored();
      } else {
        const keyCeremonySetup = this.trustee.setupKeyCeremony();
        const { value: backupData } = await keyCeremonySetup.next();

        onBackupNeeded();
        onBindBackupButton(
          backupData,
          `${this.trustee.uniqueId}-election-${this.election.uniqueId}.bak`,
          async () => {
            onBackupStarted();
            await keyCeremonySetup.next();
            await this.trustee.runKeyCeremony();
            onComplete();
          }
        );
      }
    });

    await this.trustee.setup();
    onSetup();
  }
}
