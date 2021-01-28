// = require decidim/bulletin_board/decidim-bulletin_board.dev
// = require jquery

$(() => {
  const {
    Client,
    Election,
    Trustee,
    IdentificationKeys,
  } = window.decidimBulletinBoard;

  const $trusteeTable = $(".trustee-table");

  const bulletinBoardClient = new Client({
    apiEndpointUrl: "http://localhost:8000/api",
  });

  const election = new Election({
    bulletinBoardClient,
    uniqueId: $trusteeTable.data("electionUniqueId"),
  });

  $trusteeTable.find("tbody tr").each((_index, row) => {
    const $trustee = $(row);

    const trusteeContext = {
      uniqueId: $trustee.data("uniqueId"),
      publicKeyJSON: JSON.stringify($trustee.data("publicKey")),
    };

    const identificationKeys = new IdentificationKeys(
      trusteeContext.uniqueId,
      trusteeContext.publicKeyJSON
    );

    identificationKeys.present((exists) => {
      const $startButton = $trustee.find(".start-button");
      const $generateBackupButton = $trustee.find(".generate-backup-button");
      const $restoreButton = $trustee.find(".restore-button");
      const $doneMessage = $trustee.find(".done-message");

      $startButton.hide();
      $generateBackupButton.hide();
      $restoreButton.hide();
      $doneMessage.hide();

      function setupTally() {
        const trustee = new Trustee({
          uniqueId: trusteeContext.uniqueId,
          bulletinBoardClient,
          identificationKeys,
          election,
        });

        $startButton.on("click", async (event) => {
          event.preventDefault();
          $startButton.hide();

          await trustee.setup();

          if (trustee.needsToBeRestored()) {
            $generateBackupButton.show();
            $restoreButton.show();
          } else {
            await trustee.runTally();
            $doneMessage.show();
          }
        });

        $generateBackupButton.on("click", (event) => {
          $generateBackupButton.attr(
            "href",
            `data:text/plain;charset=utf-8,{"trusteeId":"${trustee.uniqueId}","electionId":"${election.uniqueId}","status":"key_ceremony.step_1","electionTrusteesCount":3,"processedMessages":[]}`
          );
          $generateBackupButton.attr(
            "download",
            `${trustee.uniqueId}-election-${election.uniqueId}.bak`
          );
        });

        $restoreButton.on("change", ".restore-button-input", (event) => {
          let file = event.target.files[0];
          const reader = new FileReader();
          reader.onload = async function ({ target }) {
            let content = target.result;
            if (trustee.restore(content)) {
              $generateBackupButton.hide();
              $restoreButton.hide();
              await trustee.runTally();
              $doneMessage.show();
            }
          };
          reader.readAsText(file);
        });

        $startButton.show();
      }

      if (exists) {
        setupTally();
      }
    });
  });
});
