/* eslint-disable camelcase */
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

    this.castedVotes = [];
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
   * Setups an election given the corresponding params.
   *
   * @param {Object} electionData - Some data related to the election.
   * @returns {undefined}
   */
  setupElection({ title, uniqueId, votingSchemeName }) {
    cy.findByText("Setup new election").click();
    cy.findByLabelText(/Voting scheme name/).select(votingSchemeName);
    cy.findByLabelText(/Election ID/)
      .clear()
      .type(uniqueId);
    cy.findAllByLabelText(/Election title/)
      .clear()
      .type(title);
    cy.findByText("Create").click();
  }

  /**
   * Starts the key ceremony process.
   *
   * @returns {undefined}
   */
  startKeyCeremony() {
    cy.findByText("created").should("be.visible");
    cy.findByText("Start key ceremony").click().should("not.exist");
  }

  /**
   * Assert that the key ceremony has started checking the election status.
   *
   * @returns {undefined}
   */
  assertKeyCeremonyHasStarted() {
    cy.findByText("created").should("not.exist");
    cy.findByText("key_ceremony").should("be.visible");

    cy.log("Key Ceremony started");
  }

  /**
   * Upload the trustee private keys and perform the key ceremony process.
   *
   * @param {String} electionTitle - The title of the election.
   * @param {Array<Object>} trustees - A collection of Trustee objects.
   *
   * @returns {undefined}
   */
  performKeyCeremony(electionTitle, trustees) {
    cy.findByText("Perform key ceremony").click().should("not.exist");
    cy.findByText(`Key ceremony for ${electionTitle}`).should("be.visible");

    trustees.forEach(({ unique_id, name }) => {
      cy.findByText(name)
        .parent("tr")
        .within((trusteeRow) => {
          // Ensure that the button is present before starting to upload the keys
          cy.findByText("Upload private key").should("be.visible");

          // When the upload button is rendered on the screen the change event callback
          // may not be set yet, so we wait a reasonable time to ensure it is set correctly.
          cy.wait(1000);

          // Emulate trustee uploading the private key file
          cy.get(trusteeRow)
            .find(".private-key-input")
            .attachFile(
              {
                filePath: `../../lib/assets/${unique_id
                  .split(/[. ]+/)
                  .pop()}-private-key.jwk`,
              },
              {
                force: true,
              }
            );

          cy.findByText("Start").click();

          cy.findByText(name)
            .parent("tr")
            .within(() => {
              cy.findByText("Backup").click({ timeout: 120_000 });
            });
        });
    });
  }

  /**
   * Assert that the key ceremony has ended checking the election status.
   *
   * @param {Array<Object>} trustees - A collection of Trustee objects.
   *
   * @returns {undefined}
   */
  assertKeyCeremonyHasEnded(trustees) {
    trustees.forEach(({ name }) => {
      cy.contains(name)
        .parent("tr")
        .within(() => {
          cy.findByText("Done").should("be.visible");
        });
    });

    cy.findByText("Back").click();

    cy.findByText("key_ceremony").should("not.exist");
    cy.findByText("key_ceremony_ended").should("be.visible");

    cy.log("Key Ceremony ended");
  }

  /**
   * Starts the vote process.
   *
   * @returns {undefined}
   */
  startVote() {
    cy.findByText("Start vote").click().should("not.exist");
  }

  /**
   * Assert that the vote has started checking the election status.
   *
   * @returns {undefined}
   */
  assertVoteHasStarted() {
    cy.findByText("key_ceremony_ended").should("not.exist");
    cy.findByText("vote").should("be.visible");

    cy.log("Vote started");
  }

  /**
   * Encrypt a vote.
   *
   * @returns {undefined}
   */
  encryptVote() {
    cy.findByText("Vote").click();
    cy.findByText("Encrypt vote").should("be.visible").click();
  }

  /**
   * Assert that the ballot hash is present
   *
   * @returns {undefined}
   */
  assertBallotHashIsPresent() {
    cy.findByText("Encrypt vote").should("be.disabled");
    cy.findByText(/Your ballot identifier is:/, {
      timeout: 120_000,
    }).should("be.visible");
  }

  /**
   * Audit a vote.
   *
   * @returns {undefined}
   */
  auditVote() {
    cy.findByText("Audit vote").should("be.visible").click();
  }

  /**
   * Assert that the vote has been audited successfully.
   *
   * @returns {undefined}
   */
  assertVoteHasBeenAudited() {
    cy.findByText("Your vote has been audited successfully").should(
      "be.visible"
    );
    cy.findByText("Back").click();
  }

  /**
   * Cast a vote.
   *
   * @returns {undefined}
   */
  castVote() {
    cy.findByText("Vote").click();
    cy.findByLabelText(/Vote content/)
      .invoke("text")
      .then((vote) => {
        this.castedVotes.push(Object.values(JSON.parse(vote)).flat());
      });
    cy.findByText("Encrypt vote").should("be.visible").click();
    cy.findByText("Cast vote", {
      timeout: 120_000,
    })
      .should("be.visible")
      .click();
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
   * End the vote process.
   *
   * @returns {undefined}
   */
  endVote() {
    cy.findByText("key_ceremony_ended").should("not.exist");
    cy.findByText("End vote").click().should("not.exist");
  }

  /**
   * Assert that the vote has ended checking the election status.
   *
   * @returns {undefined}
   */
  assertVoteHasEnded() {
    cy.findByText("vote").should("not.exist");
    cy.findByText("vote_ended").should("be.visible");

    cy.log("Vote ended");
  }

  /**
   * Starts the tally process.
   *
   * @returns {undefined}
   */
  startTally() {
    cy.findByText("vote_ended").should("be.visible");
    cy.findByText("Start tally").click().should("not.exist");
  }

  /**
   * Assert that the tally has started checking the election status.
   *
   * @returns {undefined}
   */
  assertTallyHasStarted() {
    cy.findByText("vote_ended").should("not.exist");
    cy.findByText("tally").should("be.visible");

    cy.log("Tally started");
  }

  /**
   * Restore the trustee state and perform the tally process.
   *
   * @param {String} electionTitle - The title of the election.
   * @param {String} electionUniqueId - The election unique id.
   * @param {Array<Object>} trustees - A collection of Trustee objects.
   *
   * @returns {undefined}
   */
  performTally(electionTitle, electionUniqueId, trustees) {
    cy.findByText("Perform tally").click().should("not.exist");
    cy.findByText(`Tally for ${electionTitle}`).should("be.visible");

    trustees.forEach(({ unique_id, name }) => {
      cy.findByText(name)
        .parent("tr")
        .within((trusteeRow) => {
          cy.findByText("Start").click({
            timeout: 120_000,
          });

          // Wait a decent amount of time to make sure electionguard is loaded.
          cy.wait(15_000);

          // Ensure that the button is present before starting to upload the trustee state
          cy.findByText("Restore").should("be.visible");

          // When the upload button is rendered on the screen the change event callback
          // may not be set yet, so we wait a reasonable time to ensure it is set correctly.
          cy.wait(1000);

          // Emulate trustee uploading the private key file
          cy.get(trusteeRow)
            .find(".restore-button-input")
            .attachFile(
              {
                filePath: `../downloads/${unique_id
                  .split(/[. ]+/)
                  .pop()}-election-decidim-test-authority.${electionUniqueId}.bak`,
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
   * @param {Array<Object>} trustees - A collection of Trustee objects.
   *
   * @returns {undefined}
   */
  assertTallyHasEnded(trustees) {
    trustees.forEach(({ name }) => {
      cy.contains(name)
        .parent("tr")
        .within(() => {
          cy.findByText("Done").should("be.visible");
        });
    });

    cy.findByText("Back").click();

    cy.findByText("tally").should("not.exist");
    cy.findByText("tally_ended").should("be.visible");

    cy.log("Tally ended");
  }

  /**
   * Publish the election results.
   *
   * @returns {undefined}
   */
  publishResults() {
    cy.findByText("tally_ended").should("be.visible");
    cy.findByText("Publish results").click().should("not.exist");
  }

  /**
   * Assert that the election results have been published.
   *
   * @returns {undefined}
   */
  assertResultsPublished() {
    cy.findByText("tally_ended").should("not.exist");
    cy.findByText("results_published").should("be.visible");

    cy.log("Results published");
  }

  /**
   * View the election results.
   * @param {String} electionTitle - The title of the election.
   *
   * @returns {undefined}
   */
  viewResults(electionTitle) {
    cy.findByText("View results").click().should("not.exist");
    cy.findByText(`Results for ${electionTitle}`).should("be.visible");
  }

  /**
   * Assert that the election results are correct.
   *
   * @returns {undefined}
   */
  assertCorrectResults() {
    const flatVotes = this.castedVotes.flat();
    const totals = {};

    for (const i in flatVotes) {
      totals[flatVotes[i]] = (totals[flatVotes[i]] || 0) + 1; // increments count if element already exists
    }

    for (const answer in Object.keys(totals)) {
      cy.findByText(`${answer}: ${totals[answer]}`).should("be.visible");
    }
  }
}
