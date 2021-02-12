import {
  VoterWrapper,
  CREATE_ELECTION,
  END_KEY_CEREMONY,
} from "./voter_wrapper_dummy";

import {
  AUTHORITY_TYPE,
  BULLETIN_BOARD_TYPE,
} from "../client/message-identifier";

const contestsExample = [
  {
    object_id: "question-1",
    ballot_selections: [
      {
        object_id: "question-1-answer-1",
      },
      {
        object_id: "question-1-answer-2",
      },
    ],
  },
  {
    object_id: "question-2",
    ballot_selections: [
      {
        object_id: "question-2-answer-1",
      },
      {
        object_id: "question-2-answer-2",
      },
    ],
  },
];

describe("VoterWrapper", () => {
  const defaultParams = {
    voterId: "voter-1",
  };

  const buildVoterWrapper = (params = defaultParams) => {
    return new VoterWrapper(params);
  };

  let wrapper;

  beforeEach(() => {
    wrapper = buildVoterWrapper();
  });

  it("initialises the trustee wrapper with the given params", () => {
    expect(wrapper.voterId).toEqual(defaultParams.voterId);
    expect(wrapper.jointElectionKey).toEqual(null);
    expect(wrapper.contests).toEqual({});
  });

  describe("processMessage", () => {
    describe("when it receives the CREATE_ELECTION message", () => {
      it("changes the wrapper status and stores some data", () => {
        wrapper.processMessage(
          {
            electionId: "some-authority.some-id",
            type: CREATE_ELECTION,
            subtype: null,
            typeSubtype: CREATE_ELECTION,
            author: {
              type: AUTHORITY_TYPE,
              id: "some-authority-id",
            },
          },
          {
            description: {
              contests: contestsExample,
            },
          }
        );

        expect(wrapper.contests).toEqual(contestsExample);
        expect(wrapper.jointElectionKey).toEqual(null);
      });
    });

    describe("when it receives the END_KEY_CEREMONY message", () => {
      it("changes the wrapper status and stores some data", () => {
        wrapper.processMessage(
          {
            electionId: "some-authority.some-id",
            type: END_KEY_CEREMONY,
            subtype: null,
            typeSubtype: END_KEY_CEREMONY,
            author: {
              type: BULLETIN_BOARD_TYPE,
              id: "some-bb-id",
            },
          },
          {
            content: JSON.stringify({
              joint_election_key: 123456789,
            }),
          }
        );

        expect(wrapper.jointElectionKey).toEqual(123456789);
      });
    });
  });

  describe("encrypt", () => {
    beforeEach(() => {
      wrapper.contests = contestsExample;
      wrapper.jointElectionKey = 123456789;
      jest.spyOn(Math, "random").mockImplementation(() => 0.5);
    });

    describe("when it receives a valid vote", () => {
      it("returns a JSON with the encrypted ballot", async () => {
        const response = await wrapper.encrypt({
          "question-1": ["question-1-answer-1"],
          "question-2": ["question-2-answer-2"],
        });

        expect(response.encryptedBallot).toEqual(
          `{"ballot_style":"ballot-style","contests":[{"object_id":"question-1","ballot_selections":[{"object_id":"question-1-answer-1","ciphertext":${
            250 * 123456789 + 1
          }},{"object_id":"question-1-answer-2","ciphertext":${
            250 * 123456789
          }}]},{"object_id":"question-2","ballot_selections":[{"object_id":"question-2-answer-1","ciphertext":${
            250 * 123456789
          }},{"object_id":"question-2-answer-2","ciphertext":${
            250 * 123456789 + 1
          }}]}]}`
        );
      });

      it("returns an Object with the audited ballot", async () => {
        const response = await wrapper.encrypt({
          "question-1": ["question-1-answer-1"],
          "question-2": ["question-2-answer-2"],
        });

        expect(response.auditableBallot).toEqual({
          ballot_style: "ballot-style",
          contests: [
            {
              ballot_selections: [
                {
                  ciphertext: 30864197251,
                  object_id: "question-1-answer-1",
                  plaintext: 1,
                  random: 0.5,
                },
                {
                  ciphertext: 30864197250,
                  object_id: "question-1-answer-2",
                  plaintext: 0,
                  random: 0.5,
                },
              ],
              object_id: "question-1",
            },
            {
              ballot_selections: [
                {
                  ciphertext: 30864197250,
                  object_id: "question-2-answer-1",
                  plaintext: 0,
                  random: 0.5,
                },
                {
                  ciphertext: 30864197251,
                  object_id: "question-2-answer-2",
                  plaintext: 1,
                  random: 0.5,
                },
              ],
              object_id: "question-2",
            },
          ],
        });
      });
    });
  });
});
