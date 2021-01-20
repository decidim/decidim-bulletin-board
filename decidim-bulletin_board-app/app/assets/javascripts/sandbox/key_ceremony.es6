// = require sandbox/identification_keys
// = require decidim/bulletin_board/decidim-bulletin_board
// = require jquery

$(() => {
  const {
    Client,
    Election,
    Trustee,
    KeyCeremony,
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

    const identificationKeys = new window.Decidim.IdentificationKeys(
      trusteeContext.uniqueId,
      trusteeContext.publicKeyJSON
    );

    identificationKeys.present((exists) => {
      const $startButton = $trustee.find(".start-button");
      const $backupButton = $trustee.find(".backup-button");
      const $restoreButton = $trustee.find(".restore-button");
      const $doneMessage = $trustee.find(".done-message");

      $startButton.hide();
      $backupButton.hide();
      $restoreButton.hide();
      $doneMessage.hide();

      function setupKeyCeremony() {
        const trustee = new Trustee({
          id: $trustee.data("uniqueId"),
          identificationKeys,
          election,
        });

        const keyCeremony = new KeyCeremony({
          bulletinBoardClient,
          election,
          trustee,
        });

        keyCeremony.events.subscribe((event) => {
          if (event.type === "[Message] Processed" && event.result) {
            if (event.result.save) {
              $backupButton.show();
            }

            if (event.result.done) {
              $doneMessage.show();
            }
          }
        });

        $trustee.find(".private-key").hide();

        $startButton.on("click", async (event) => {
          event.preventDefault();
          $startButton.hide();

          await keyCeremony.setup();

          if (trustee.needsToBeRestored()) {
            $restoreButton.show();
          } else {
            keyCeremony.run();
          }
        });

        $backupButton.on("click", () => {
          $backupButton.hide();
          $backupButton.attr(
            "href",
            `data:text/plain;charset=utf-8,${trustee.backup()}`
          );
          $backupButton.attr(
            "download",
            `${trustee.id}-election-${election.uniqueId}.bak`
          );
          keyCeremony.run();
        });

        $restoreButton.on("change", ".restore-button-input", (event) => {
          let file = event.target.files[0];
          const reader = new FileReader();
          reader.onload = function ({ target }) {
            let content = target.result;
            if (trustee.restore(content)) {
              $restoreButton.hide();
              keyCeremony.run();
            }
          };
          reader.readAsText(file);
        });

        $startButton.show();
      }

      if (exists) {
        setupKeyCeremony();
      } else {
        $trustee.on("change", ".private-key-input", async (event) => {
          await identificationKeys.upload(event, true);
          setupKeyCeremony();
        });
      }
    });
  });
});
