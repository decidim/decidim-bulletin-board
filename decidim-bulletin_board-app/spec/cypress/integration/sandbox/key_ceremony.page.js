export class KeyCeremonyPage {
  setup(onSetupFn) {
    cy.appScenario("key_ceremony").then((scenarioData) => {
      onSetupFn(scenarioData);
    });
  }

  visit() {
    cy.visit("/sandbox/elections");
  }

  startKeyCeremony() {
    cy.findByText("created");
    cy.findByText("Start key ceremony").click();
  }

  performKeyCeremony({ title }, trustees) {
    cy.reload();
    cy.findByText("key_ceremony");
    cy.findByText("Perform key ceremony").click();
    cy.findByText(`Key ceremony for ${title}`);

    trustees.forEach(({ unique_id, name }) => {
      cy.findByText(name)
        .parent("tr")
        .within((trusteeRow) => {
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
