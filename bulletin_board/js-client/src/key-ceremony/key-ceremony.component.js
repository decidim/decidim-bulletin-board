// Components
import { TrusteeComponent } from "../trustee/trustee.component";

/**
 * This class is used to bind any UI elements to a key ceremony process.
 */
export class KeyCeremonyComponent extends TrusteeComponent {
  /**
   * Setup the election for the trustee.
   *
   * @param {Object} params - An object that contains the initialization params.
   *  - {Object} bulletinBoardClientParams - An object to configure the bulletin board client.
   *  - {String} electionUniqueId - The unique identifier of an election.
   *  - {Number} authorizationExpirationTimestamp - The timestamp until the authorization header is no longer valid.
   *
   * @returns {Promise<undefined>}
   */
  setupElection({
    bulletinBoardClientParams,
    electionUniqueId,
    authorizationExpirationTimestamp,
  }) {
    return this.setupElectionWithTypesFilter({
      electionUniqueId,
      bulletinBoardClientParams,
      authorizationExpirationTimestamp,
      typesFilter: [
        "create_election",
        "start_key_ceremony",
        "key_ceremony",
        "end_key_ceremony",
      ],
    });
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
   * - {Function} onBackupNeeded - a function that is called when the trustee backup is required.
   * - {Function} onBindBackupButton - a function that receives a callback function that will be called when
   *                                   the trustee backup must be started.
   * - {Function} onBackupStarted - a function that is called when the backup has started.
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
    onBackupNeeded,
    onBindBackupButton,
    onBackupStarted,
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
        const keyCeremonySetup = this.trustee.setupKeyCeremony();
        const { value: backupData } = await keyCeremonySetup.next();

        onBackupNeeded();
        onBindBackupButton(
          backupData,
          `${this.trustee.uniqueId}-election-${this.trustee.election.uniqueId}.bak`,
          async () => {
            onBackupStarted();
            await keyCeremonySetup.next();
            await this.trustee.runKeyCeremony();
            onComplete();
          }
        );
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
          await this.trustee.runKeyCeremony();
          onComplete();
        }
      };
      reader.readAsText(file);
    });
  }
}
