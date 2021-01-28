// = require decidim/bulletin_board/decidim-bulletin_board.dev
// = require jquery

$(() => {
  const { TallyComponent, IdentificationKeys } = window.decidimBulletinBoard;

  // UI Elements
  const $trusteeTable = $(".trustee-table");

  // Data
  const bulletinBoardClientParams = {
    apiEndpointUrl: "http://localhost:8000/api",
  };
  const electionUniqueId = $trusteeTable.data("electionUniqueId");

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
    const $generateBackupButton = $trustee.find(".generate-backup-button");
    const $restoreButton = $trustee.find(".restore-button");
    const $doneMessage = $trustee.find(".done-message");

    $startButton.hide();
    $generateBackupButton.hide();
    $restoreButton.hide();
    $doneMessage.hide();

    // Use the tally component and bind all UI events
    const component = new TallyComponent({
      bulletinBoardClientParams,
      electionUniqueId,
      trusteeUniqueId: trusteeContext.uniqueId,
      trusteeIdentificationKeys,
    });
    window.components[trusteeContext.uniqueId] = component;

    const bindComponentEvents = async () => {
      await component.bindEvents({
        onEvent(_event) {},
        onSetup() {
          $startButton.show();
          $generateBackupButton.on("click", (event) => {
            $generateBackupButton.attr(
              "href",
              `data:text/plain;charset=utf-8,{"trusteeId":"${trusteeContext.uniqueId}","electionId":"${electionUniqueId}","status":"key_ceremony.step_1","electionTrusteesCount":3,"processedMessages":[]}`
            );
            $generateBackupButton.attr(
              "download",
              `${trusteeContext.uniqueId}-election-${electionUniqueId}.bak`
            );
          });
        },
        onBindStartButton(onEventTriggered) {
          $startButton.on("click", onEventTriggered);
        },
        onStart() {
          $startButton.hide();
        },
        onComplete() {
          $doneMessage.show();
        },
        onTrusteeNeedsToBeRestored() {
          $generateBackupButton.show();
          $restoreButton.show();
        },
        onBindRestoreButton(onEventTriggered) {
          $restoreButton.on(
            "change",
            ".restore-button-input",
            onEventTriggered
          );
        },
        onRestore() {
          $generateBackupButton.hide();
          $restoreButton.hide();
        },
      });
    };

    trusteeIdentificationKeys.present(async (exists) => {
      if (exists) {
        await bindComponentEvents();
      }
    });
  });
});
