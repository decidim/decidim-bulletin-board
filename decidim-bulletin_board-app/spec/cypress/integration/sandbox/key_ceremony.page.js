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
