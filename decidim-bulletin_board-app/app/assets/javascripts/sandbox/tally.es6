// = require sandbox/identification_keys
// = require decidim/bulletin_board/decidim-bulletin_board.dev
// = require jquery

$(() => {
  const { Client, Election, Trustee, Tally } = window.decidimBulletinBoard;

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

    const identificationKeys = new window.Decidim.IdentificationKeys(
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
          id: $trustee.data("uniqueId"),
          identificationKeys,
          election,
        });

        const tally = new Tally({
          bulletinBoardClient,
          election,
          trustee,
        });

        tally.events.subscribe((event) => {
          if (event.type === "[Message] Processed" && event.result) {
            if (event.result.cast) {
              $doneMessage.show();
            }
          }
        });

        $startButton.on("click", async (event) => {
          event.preventDefault();
          $startButton.hide();

          await tally.setup();

          if (trustee.needsToBeRestored()) {
            $generateBackupButton.show();
            $restoreButton.show();
          } else {
            tally.run();
          }
        });

        $generateBackupButton.on("click", (event) => {
          $generateBackupButton.attr(
            "href",
            `data:text/plain;charset=utf-8,{"trusteeId":"${trustee.id}","electionId":"${election.uniqueId}","status":"key_ceremony.step_1","electionTrusteesCount":3,"processedMessages":[]}`
          );
          $generateBackupButton.attr(
            "download",
            `${trustee.id}-election-${election.uniqueId}.bak`
          );
        });

        $restoreButton.on("change", ".restore-button-input", (event) => {
          let file = event.target.files[0];
          const reader = new FileReader();
          reader.onload = function ({ target }) {
            let content = target.result;
            if (trustee.restore(content)) {
              $generateBackupButton.hide();
              $restoreButton.hide();
              tally.run();
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
