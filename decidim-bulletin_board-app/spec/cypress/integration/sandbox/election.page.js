const IDENTIFICATION_KEYS_DATABASE_NAME = "identification_keys";

/**
 * This is a page class used to abstract user interactions with the UI elements
 * from the actual tests.
 */
export class ElectionPage {
  /**
   * Clears the IndexDB database to start with a clean slate. Then setups the minimum
   * data to start the whole process.
   *
   * @param {Function} onSetupFn - a function called with the setup data from the scenario.
   *
   * @returns {undefined}
   */
  setup(onSetupFn) {
    // Clear the IndexDB database every test so we always start fresh
    window.indexedDB.deleteDatabase(IDENTIFICATION_KEYS_DATABASE_NAME);

    cy.appScenario("election").then((scenarioData) => {
      onSetupFn(scenarioData);
    });
  }

  /**
   * Visits the sandbox elections page.
   *
   * @returns {undefined}
   */
  visit() {
    cy.visit("/sandbox/elections");
  }

  /**
   * Starts the key ceremony process for the given election.
   *
   * @param {Object} election - An Election object.
   *
   * @returns {undefined}
   */
  startKeyCeremony(election) {
    this.withinElectionRow(election, () =>
      cy.findByText("created").should("be.visible")
    );

    this.withinElectionRow(election, () =>
      cy.findByText("Start key ceremony").click().should("not.exist")
    );
  }

  /**
   * Assert that the key ceremony has started checking the election status.
   *
   * @param {Object} election - An Election instance.
   *
   * @returns {undefined}
   */
  assertKeyCeremonyHasStarted(election) {
    this.withinElectionRow(election, () =>
      cy.findByText("created").should("not.exist")
    );

    this.withinElectionRow(election, () =>
      cy.findByText("key_ceremony").should("be.visible")
    );

    cy.log("Key Ceremony started");
  }

  /**
   * Upload the trustee private keys and perform the key ceremony process.
   *
   * @param {Object} election - An Election object.
   * @param {Array<Object>} trustees - A collection of Trustee objects.
   *
   * @returns {undefined}
   */
  performKeyCeremony(election, trustees) {
    this.withinElectionRow(election, () => {
      cy.findByText("Perform key ceremony").click().should("not.exist");
    });

    cy.findByText(`Key ceremony for ${election.title}`).should("be.visible");

    trustees.forEach(({ unique_id, name }) => {
      cy.findByText(name)
        .parent("tr")
        .within((trusteeRow) => {
          // Ensure that the button is present before starting to upload the keys
          cy.findByText("Upload private key").should("be.visible");

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

          cy.findByText("Start").click();
          cy.findByText("Backup").click();
        });
    });
  }

  /**
   * Assert that the key ceremony has ended checking the election status.
   *
   * @param {Object} election - An Election object.
   * @param {Array<Object>} trustees - A collection of Trustee objects.
   *
   * @returns {undefined}
   */
  assertKeyCeremonyHasEnded(election, trustees) {
    trustees.forEach(({ name }) => {
      cy.contains(name)
        .parent("tr")
        .within(() => {
          cy.findByText("Done").should("be.visible");
        });
    });

    cy.findByText("Back").click();

    this.withinElectionRow(election, () =>
      cy.findByText("key_ceremony").should("not.exist")
    );

    this.withinElectionRow(election, () =>
      cy.findByText("key_ceremony_ended").should("be.visible")
    );

    cy.log("Key Ceremony ended");
  }

  /**
   * Starts the vote process for the given election.
   *
   * @param {Object} election - An Election object.
   *
   * @returns {undefined}
   */
  startVote(election) {
    this.withinElectionRow(election, () =>
      cy.findByText("Start vote").click().should("not.exist")
    );
  }

  /**
   * Assert that the vote has started checking the election status.
   *
   * @param {Object} election - An Election instance.
   *
   * @returns {undefined}
   */
  assertVoteHasStarted(election) {
    this.withinElectionRow(election, () =>
      cy.findByText("key_ceremony_ended").should("not.exist")
    );

    this.withinElectionRow(election, () =>
      cy.findByText("vote").should("be.visible")
    );

    cy.log("Vote started");
  }

  /**
   * Cast a vote for the given election.
   *
   * @param {Object} election - An Election instance.
   *
   * @returns {undefined}
   */
  castVote(election) {
    this.withinElectionRow(election, () => {
      cy.findByText("Vote").click();
    });
    cy.findByText("Cast vote").should("not.be.disabled").click();
  }

  /**
   * Assert that the vote has been casted successfully.
   *
   * @returns {undefined}
   */
  assertVoteHasBeenCasted() {
    cy.findByText("Your vote has been casted successfully").should(
      "be.visible"
    );
    cy.findByText("Back").click();
  }

  /**
   * End the vote process for the given election.
   *
   * @param {Object} election - An Election object.
   *
   * @returns {undefined}
   */
  endVote(election) {
    this.withinElectionRow(election, () =>
      cy.findByText("key_ceremony_ended").should("not.exist")
    );

    this.withinElectionRow(election, () =>
      cy.findByText("End vote").click().should("not.exist")
    );
  }

  /**
   * Assert that the vote has ended checking the election status.
   *
   * @param {Object} election - An Election instance.
   *
   * @returns {undefined}
   */
  assertVoteHasEnded(election) {
    this.withinElectionRow(election, () =>
      cy.findByText("vote").should("not.exist")
    );

    this.withinElectionRow(election, () =>
      cy.findByText("vote_ended").should("be.visible")
    );

    cy.log("Vote ended");
  }

  /**
   * Prepare a context to find elements in an election row from the list.
   *
   * @param {Object} election - An Election instance.
   * @param {Function} fn - The function that will be called with that context.
   *
   * @private
   */
  withinElectionRow({ unique_id: uniqueId }, fn) {
    cy.findByText(uniqueId).parent("tr").within(fn);
  }

  /**
   * Starts the tally process for the given election.
   *
   * @param {Object} election - An Election object.
   *
   * @returns {undefined}
   */
  startTally(election) {
    this.withinElectionRow(election, () =>
      cy.findByText("vote_ended").should("be.visible")
    );

    this.withinElectionRow(election, () =>
      cy.findByText("Start tally").click().should("not.exist")
    );
  }

  /**
   * Assert that the tally has started checking the election status.
   *
   * @param {Object} election - An Election instance.
   *
   * @returns {undefined}
   */
  assertTallyHasStarted(election) {
    this.withinElectionRow(election, () =>
      cy.findByText("vote_ended").should("not.exist")
    );

    this.withinElectionRow(election, () =>
      cy.findByText("tally").should("be.visible")
    );

    cy.log("Tally started");
  }

  /**
   * Restore the trustee state and perform the tally process.
   *
   * @param {Object} election - An Election object.
   * @param {Array<Object>} trustees - A collection of Trustee objects.
   *
   * @returns {undefined}
   */
  performTally(election, trustees) {
    this.withinElectionRow(election, () => {
      cy.findByText("Perform tally").click().should("not.exist");
    });

    cy.findByText(`Tally for ${election.title}`).should("be.visible");

    trustees.forEach(({ unique_id, name }) => {
      cy.findByText(name)
        .parent("tr")
        .within((trusteeRow) => {
          cy.findByText("Start").click();

          // Ensure that the button is present before starting to upload the trustee state
          cy.findByText("Restore").should("be.visible");

          // When the upload button is rendered on the screen the change event callback
          // may not be set yet, so we wait a reasonable time to ensure it is set correctly.
          cy.wait(500);

          // Emulate trustee uploading the private key file
          cy.get(trusteeRow)
            .find(".restore-button-input")
            .attachFile(
              {
                filePath: `../downloads/${unique_id}-election-${election.unique_id}.bak`,
              },
              {
                force: true,
              }
            );
        });
    });
  }

  /**
   * Assert that the tally has ended checking the election status.
   *
   * @param {Object} election - An Election object.
   * @param {Array<Object>} trustees - A collection of Trustee objects.
   *
   * @returns {undefined}
   */
  assertTallyHasEnded(election, trustees) {
    trustees.forEach(({ name }) => {
      cy.contains(name)
        .parent("tr")
        .within(() => {
          cy.findByText("Done").should("be.visible");
        });
    });

    cy.findByText("Back").click();

    this.withinElectionRow(election, () =>
      cy.findByText("tally").should("not.exist")
    );

    this.withinElectionRow(election, () =>
      cy.findByText("tally_ended").should("be.visible")
    );

    cy.log("Tally ended");
  }
}
