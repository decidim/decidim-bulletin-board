export class ListElectionsPage {
  setup(onSetupFn) {
    cy.appScenario("list_elections").then((scenarioData) => {
      onSetupFn(scenarioData);
    });
  }

  visit() {
    cy.visit("/sandbox/elections");
  }

  assertElectionsDataIsPresent(elections) {
    elections.forEach(({ unique_id, title }) => {
      cy.contains(unique_id);
      cy.contains(title);
    });
  }
}
