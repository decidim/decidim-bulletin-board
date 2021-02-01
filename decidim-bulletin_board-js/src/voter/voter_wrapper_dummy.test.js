import {
  VoterWrapper,
  CREATE_ELECTION,
  END_KEY_CEREMONY,
} from "./voter_wrapper_dummy";

import {
  MessageIdentifier,
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
          MessageIdentifier.format(
            "some-authority.some-id",
            CREATE_ELECTION,
            AUTHORITY_TYPE,
            "some-authority-id"
          ),
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
          MessageIdentifier.format(
            "some-authority.some-id",
            END_KEY_CEREMONY,
            BULLETIN_BOARD_TYPE,
            "some-bb-id"
          ),
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

        expect(response).toEqual(
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
    });
  });
});
