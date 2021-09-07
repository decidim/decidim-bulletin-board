import {
  TrusteeWrapper,
  NONE,
  CREATED,
  KEY_CEREMONY,
  KEY_CEREMONY_ENDED,
  TALLY,
  TALLY_ENDED,
  START_KEY_CEREMONY,
  KEY_CEREMONY_STEP_1,
  END_KEY_CEREMONY,
  START_TALLY,
  TALLY_CAST,
  TALLY_SHARE,
  END_TALLY,
  CREATE_ELECTION,
} from "./trustee_wrapper";

describe("TrusteeWrapper", () => {
  const defaultParams = {
    trusteeId: "trustee-1",
  };

  const buildTrusteeWrapper = (params = defaultParams) => {
    return new TrusteeWrapper(params);
  };

  let wrapper;

  beforeEach(() => {
    wrapper = buildTrusteeWrapper();
  });

  it("initialises the trustee wrapper with the given params", () => {
    expect(wrapper.trusteeId).toEqual(defaultParams.trusteeId);
    expect(wrapper.status).toEqual(NONE);
    expect(wrapper.electionPublicKey).toEqual(0);
  });

  describe("processMessage", () => {
    describe("when the status is NONE", () => {
      describe("when it receives the CREATE_ELECTION message", () => {
        it("changes the wrapper status and stores some data", () => {
          const response = wrapper.processMessage(CREATE_ELECTION, {
            scheme: { quorum: 2 },
          });
          expect(wrapper.status).toEqual(CREATED);
          expect(wrapper.quorum).toEqual(2);
          expect(response).toEqual(undefined);
        });
      });

      describe("when it receives any other message", () => {
        it("doesn't do anything", () => {
          wrapper.processMessage("some-type", {});
          expect(wrapper.status).toEqual(NONE);
        });
      });
    });

    describe("when the status is CREATED", () => {
      beforeEach(() => {
        wrapper.status = CREATED;
      });
      describe("when it receives the START_KEY_CEREMONY message", () => {
        it("changes the wrapper status and stores some data", () => {
          const response = wrapper.processMessage(START_KEY_CEREMONY, {});
          expect(wrapper.status).toEqual(KEY_CEREMONY);
          expect(wrapper.electionPublicKey).not.toEqual(0);
          expect(response).toEqual({
            content: `{"election_public_key":${wrapper.electionPublicKey},"owner_id":"trustee-1"}`,
            messageType: KEY_CEREMONY_STEP_1,
          });
        });
      });

      describe("when it receives any other message", () => {
        it("doesn't do anything", () => {
          wrapper.processMessage("some-type", {});
          expect(wrapper.status).toEqual(CREATED);
        });
      });
    });

    describe("when the status is KEY_CEREMONY", () => {
      beforeEach(() => {
        wrapper.status = KEY_CEREMONY;
      });

      describe("when it receives the END_KEY_CEREMONY message", () => {
        it("changes the wrapper status", () => {
          wrapper.processMessage(END_KEY_CEREMONY, { content: "{}" });
          expect(wrapper.status).toEqual(KEY_CEREMONY_ENDED);
        });
      });

      describe("when it receives any other message", () => {
        it("doesn't do anything", () => {
          wrapper.processMessage("some-type", {});
          expect(wrapper.status).toEqual(KEY_CEREMONY);
        });
      });
    });

    describe("when the status is KEY_CEREMONY_ENDED", () => {
      beforeEach(() => {
        wrapper.status = KEY_CEREMONY_ENDED;
      });

      describe("when it receives the START_TALLY message", () => {
        it("changes the wrapper status", () => {
          wrapper.processMessage(START_TALLY, {});
          expect(wrapper.status).toEqual(TALLY);
        });
      });

      describe("when it receives any other message", () => {
        it("doesn't do anything", () => {
          wrapper.processMessage("some-type", {});
          expect(wrapper.status).toEqual(KEY_CEREMONY_ENDED);
        });
      });
    });

    describe("when the status is TALLY", () => {
      beforeEach(() => {
        wrapper.status = TALLY;
        wrapper.electionPublicKey = 123;
        wrapper.electionId = "some-authority.some-id";
      });

      describe("when it receives the TALLY_CAST message", () => {
        it("returns some data", () => {
          const response = wrapper.processMessage(TALLY_CAST, {
            content: JSON.stringify({
              "question-1": {
                "q1-answer-1": 123 * 456 * 789 + 2,
                "q1-answer-2": 123 * 456 * 789 + 4,
              },
              "question-2": {
                "q2-answer-1": 123 * 456 * 789 + 3,
                "q2-answer-2": 123 * 456 * 789 + 5,
              },
            }),
          });
          expect(response).toEqual({
            content: `{"owner_id":"trustee-1","contests":{"question-1":{"q1-answer-1":${
              123 * 2
            },"q1-answer-2":${123 * 4}},"question-2":{"q2-answer-1":${
              123 * 3
            },"q2-answer-2":${123 * 5}}}}`,
            messageType: TALLY_SHARE,
          });
        });
      });

      describe("when it receives the END_TALLY message", () => {
        it("returns some data", () => {
          wrapper.processMessage(END_TALLY, {});
          expect(wrapper.status).toEqual(TALLY_ENDED);
        });
      });
    });
  });

  describe("isFresh", () => {
    it("returns false when the wrapper status is not the initial state", () => {
      wrapper.status = KEY_CEREMONY;
      expect(wrapper.isFresh()).toBeFalsy();
    });

    it("returns true when the wrapper status is the initial state", () => {
      expect(wrapper.isFresh()).toBeTruthy();
    });
  });

  describe("backup", () => {
    it("returns a JSON representation of the wrapper", () => {
      expect(wrapper.backup()).toEqual(
        `{"trusteeId":"trustee-1","status":${NONE},"electionPublicKey":0,"jointElectionKey":0,"tallyCastMessage":null,"quorum":0,"trusteesKeys":{},"trusteesShares":{}}`
      );
    });

    describe("after creating the election keys", () => {
      beforeEach(() => {
        wrapper.processMessage(CREATE_ELECTION, { scheme: { quorum: 2 } });
        wrapper.processMessage(START_KEY_CEREMONY, {});
      });

      it("returns a JSON representation of the wrapper in the KEY_CEREMONY status", () => {
        expect(wrapper.backup()).toEqual(
          `{"trusteeId":"trustee-1","status":${KEY_CEREMONY},"electionPublicKey":${wrapper.electionPublicKey},"jointElectionKey":0,"tallyCastMessage":null,"quorum":2,"trusteesKeys":{},"trusteesShares":{}}`
        );
      });
    });
  });

  describe("restore", () => {
    it("restore the state of the wrapper from a backup", () => {
      wrapper.status = KEY_CEREMONY;
      const backup = wrapper.backup();

      wrapper = buildTrusteeWrapper();
      expect(wrapper.status).toEqual(NONE);
      expect(wrapper.restore(backup, KEY_CEREMONY_STEP_1)).toBeTruthy();
      expect(wrapper.status).toEqual(KEY_CEREMONY);
    });

    it("doesn't restore the state of the wrapper from a backup if it's not right", () => {
      const backup = wrapper.backup();

      wrapper.status = TALLY;
      expect(wrapper.restore(backup, KEY_CEREMONY_STEP_1)).toBeFalsy();
      expect(wrapper.status).toEqual(TALLY);
    });

    it("doesn't restore the state from another Trustee", () => {
      const backup = new TrusteeWrapper({ trusteeId: "trustee-2" }).backup();

      expect(wrapper.restore(backup, null)).toBeFalsy();
      expect(wrapper.trusteeId).toEqual("trustee-1");
    });
  });
});
