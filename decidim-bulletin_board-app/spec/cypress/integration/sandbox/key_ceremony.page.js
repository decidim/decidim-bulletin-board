const IDENTIFICATION_KEYS_DATABASE_NAME = "identification_keys";
export class KeyCeremonyPage {
  setup(onSetupFn) {
    // Clear the IndexDB database every test so we always start fresh
    window.indexedDB.deleteDatabase(IDENTIFICATION_KEYS_DATABASE_NAME);

    cy.appScenario("key_ceremony").then((scenarioData) => {
      onSetupFn(scenarioData);
    });
  }

  visit() {
    cy.visit("/sandbox/elections");
  }

  startKeyCeremony() {
    cy.findByText("created").should("be.visible");
    cy.findByText("Start key ceremony").click();
  }

  performKeyCeremony({ title }, trustees) {
    cy.findByText("key_ceremony").should("be.visible");
    cy.findByText("Perform key ceremony").click();
    cy.findByText(`Key ceremony for ${title}`).should("be.visible");

    trustees.forEach(({ unique_id, name }) => {
      cy.findByText(name)
        .parent("tr")
        .within((trusteeRow) => {
          // Ensure that the button is present before starting to upload the keys
          cy.get(trusteeRow)
            .findByText("Upload private key")
            .should("be.visible");

          // When the upload button is rendered on the screen the change event callback
          // may not be set yet, so we wait a reasonable time to ensure it is set correctly.
          cy.wait(500);

          // Emulate trustee uploading the private key file
          cy.get(trusteeRow)
            .find(".private-key-input")
            .attachFile(
              {
                filePath: `../../../lib/assets/${unique_id}-private-key.jwk`,
              },
              {
                force: true,
              }
            );

          cy.get(trusteeRow).findByText("Start").click();
          cy.get(trusteeRow).findByText("Backup").click();
        });
    });
  }

  assertKeyCeremonyIsDone(trustees) {
    trustees.forEach(({ name }) => {
      cy.contains(name)
        .parent("tr")
        .within((trusteeRow) => {
          cy.get(trusteeRow).findByText("Done").should("be.visible");
        });
    });
  }
}
