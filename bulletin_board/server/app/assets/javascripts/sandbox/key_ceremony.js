//= require jquery
//= require decidim/bulletin_board/decidim-bulletin_board

$(() => {
  const { IdentificationKeys } = window.decidimBulletinBoard;

  // UI Elements
  const $trusteeTable = $(".trustee-table");

  // Data
  const bulletinBoardClientParams = {
    apiEndpointUrl: $trusteeTable.data("apiEndpointUrl"),
  };
  const electionUniqueId = $trusteeTable.data("electionUniqueId");
  const authorityPublicKeyJSON = $trusteeTable.data("authorityPublicKey");
  const votingSchemeName = $trusteeTable.data("votingSchemeName");

  $trusteeTable.find("tbody tr").each((_index, row) => {
    const $trustee = $(row);

    const trusteeContext = {
      uniqueId: $trustee.data("uniqueId"),
      publicKeyJSON: JSON.stringify($trustee.data("publicKey")),
    };

    const trusteeIdentificationKeys = new IdentificationKeys(
      trusteeContext.uniqueId,
      trusteeContext.publicKeyJSON
    );

    const $startButton = $trustee.find(".start-button");
    const $backupButton = $trustee.find(".backup-button");
    const $restoreButton = $trustee.find(".restore-button");
    const $uploadPrivateKeyButton = $trustee.find(".upload-private-key-button");
    const $doneMessage = $trustee.find(".done-message");

    // Use the correct trustee wrapper adapter
    let trusteeWrapperAdapter;

    if (votingSchemeName === "dummy") {
      trusteeWrapperAdapter = new DummyTrusteeWrapperAdapter({
        trusteeId: trusteeContext.uniqueId,
      });
    } else if (votingSchemeName === "electionguard") {
      trusteeWrapperAdapter = new ElectionGuardTrusteeWrapperAdapter({
        trusteeId: trusteeContext.uniqueId,
        workerUrl: "/assets/electionguard/webworker.js",
      });
    } else {
      throw new Error(`Voting scheme ${votingSchemeName} not supported.`);
    }

    // Use the key ceremony component and bind all UI events
    const component = new KeyCeremonyComponent({
      bulletinBoardClientParams,
      authorityPublicKeyJSON,
      electionUniqueId,
      trusteeUniqueId: trusteeContext.uniqueId,
      trusteeIdentificationKeys,
      trusteeWrapperAdapter,
    });

    const bindComponentEvents = async () => {
      $uploadPrivateKeyButton.hide();

      await component.bindEvents({
        onEvent(_event) {},
        onBindRestoreButton(onEventTriggered) {
          $restoreButton.on(
            "change",
            ".restore-button-input",
            onEventTriggered
          );
        },
        onBindStartButton(onEventTriggered) {
          $startButton.on("click", onEventTriggered);
        },
        onBindBackupButton(backupData, backupFilename, onEventTriggered) {
          $backupButton.attr(
            "href",
            `data:text/plain;charset=utf-8,${backupData}`
          );
          $backupButton.attr("download", backupFilename);
          $backupButton.on("click", onEventTriggered);
        },
        onRestore() {
          $restoreButton.hide();
        },
        onComplete() {
          $doneMessage.show();
        },
        onStart() {
          $startButton.hide();
        },
        onTrusteeNeedsToBeRestored() {
          $restoreButton.show();
        },
        onBackupNeeded() {
          $backupButton.show();
        },
        onBackupStarted() {
          $backupButton.hide();
        },
      });

      $startButton.show();
    };

    $trustee.on("change", ".private-key-input", async (event) => {
      await trusteeIdentificationKeys.upload(event, true);
      await bindComponentEvents();
    });

    trusteeIdentificationKeys.present(async (exists) => {
      if (exists) {
        await bindComponentEvents();
      } else {
        $uploadPrivateKeyButton.show();
      }
    });
  });
});
