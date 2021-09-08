import { ElectionPage } from "./election.page";

describe("Election", () => {
  const page = new ElectionPage();

  const testElection = ({
    electionTitle,
    electionUniqueId,
    electionVotingSchemeName,
    doTheVoting,
    missingTrustees,
  }) => {
    page.setup(({ trustees }) => {
      page.visit();

      page.setupElection({
        title: electionTitle,
        uniqueId: electionUniqueId,
        votingSchemeName: electionVotingSchemeName,
      });
      page.startKeyCeremony();
      page.assertKeyCeremonyHasStarted();
      page.performKeyCeremony(electionTitle, trustees);
      page.assertKeyCeremonyHasEnded(trustees);

      page.startVote();
      page.assertVoteHasStarted();
      page.encryptVote();
      page.assertBallotHashIsPresent();
      page.auditVote();
      page.assertVoteHasBeenAudited();

      doTheVoting();

      page.endVote();
      page.assertVoteHasEnded();

      page.startTally();
      page.assertTallyHasStarted();

      page.performTally(
        electionTitle,
        electionUniqueId,
        trustees,
        missingTrustees
      );
      page.assertTallyHasEnded(trustees, missingTrustees);

      page.publishResults();
      page.assertResultsPublished();
      page.viewResults(electionTitle);
      page.assertCorrectResults();
    });
  };

  it("completes the whole process using the dummy voting scheme", () => {
    testElection({
      electionTitle: "My dummy election",
      electionUniqueId: "dummy-1",
      electionVotingSchemeName: "dummy",
      doTheVoting: () => {
        for (let i = 0; i < 10; i++) {
          page.castVote();
          page.assertVoteHasBeenAccepted();
        }
      },
      missingTrustees: [1],
    });
  });

  it("completes the whole process using the electionguard voting scheme", () => {
    testElection({
      electionTitle: "My ElectionGuard election",
      electionUniqueId: "electionguard-1",
      electionVotingSchemeName: "electionguard",
      doTheVoting: () => {
        for (let i = 0; i < 2; i++) {
          page.castVote();
          page.assertVoteHasBeenAccepted();
        }
      },
      missingTrustees: [1],
    });
  });

  it("supports the in person voting feature", () => {
    testElection({
      electionTitle: "My in person election",
      electionUniqueId: "in-person-1",
      electionVotingSchemeName: "dummy",
      doTheVoting: () => {
        const voterId = "e98a86b62b97c18129a6be1f890578f069eff369";
        page.castVote(voterId, false);
        page.assertVoteHasBeenAccepted();
        page.inPersonVote(voterId);
        page.assertInPersonVoteHasBeenAccepted();
        page.castVote(voterId, false);
        page.assertVoteHasBeenRejected();
        page.inPersonVote(voterId);
        page.assertInPersonVoteHasBeenRejected();

        page.castVote(); // Add one vote to have a ballot to tally
        page.assertVoteHasBeenAccepted();
      },
      missingTrustees: [],
    });
  });
});
