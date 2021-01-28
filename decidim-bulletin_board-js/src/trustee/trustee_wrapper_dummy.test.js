import {
  TrusteeWrapper,
  CREATED,
  KEY_CEREMONY,
  KEY_CEREMONY_ENDED,
  TALLY,
  TALLY_ENDED,
  CREATE_ELECTION,
  START_KEY_CEREMONY,
  KEY_CEREMONY_STEP_1,
  END_KEY_CEREMONY,
  START_TALLY,
  TALLY_CAST,
  TALLY_SHARE,
  END_TALLY,
} from "./trustee_wrapper_dummy";

import {
  MessageIdentifier,
  AUTHORITY_TYPE,
  TRUSTEE_TYPE,
  BULLETIN_BOARD_TYPE,
} from "../client/message-identifier";

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
    expect(wrapper.electionId).toEqual(null);
    expect(wrapper.status).toEqual(CREATED);
    expect(wrapper.electionPublicKey).toEqual(0);
  });

  describe("processMessage", () => {
    describe("when the status is CREATED", () => {
      describe("when it receives the START_KEY_CEREMONY message", () => {
        it("changes the wrapper status and stores some data", () => {
          const response = wrapper.processMessage(
            MessageIdentifier.format(
              "some-authority.some-id",
              START_KEY_CEREMONY,
              AUTHORITY_TYPE,
              "some-authority-id"
            ),
            {}
          );
          expect(wrapper.status).toEqual(KEY_CEREMONY);
          expect(wrapper.electionId).toEqual("some-authority.some-id");
          expect(wrapper.electionPublicKey).not.toEqual(0);
          expect(response).toEqual({
            content: `{"election_public_key":${wrapper.electionPublicKey},"owner_id":"trustee-1"}`,
            message_id:
              "some-authority.some-id.key_ceremony.step_1+t.trustee-1",
          });
        });
      });

      describe("when it receives any other message", () => {
        it("doesn't do anything", () => {
          wrapper.processMessage(
            MessageIdentifier.format(
              "some-authority.some-id",
              "some-type",
              TRUSTEE_TYPE,
              "some-author-id"
            ),
            {}
          );
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
          wrapper.processMessage(
            MessageIdentifier.format(
              "some-authority.some-id",
              END_KEY_CEREMONY,
              BULLETIN_BOARD_TYPE,
              "some-bb-id"
            ),
            {}
          );
          expect(wrapper.status).toEqual(KEY_CEREMONY_ENDED);
        });
      });

      describe("when it receives any other message", () => {
        it("doesn't do anything", () => {
          wrapper.processMessage(
            MessageIdentifier.format(
              "some-authority.some-id",
              "some-type",
              TRUSTEE_TYPE,
              "some-author-id"
            ),
            {}
          );
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
          wrapper.processMessage(
            MessageIdentifier.format(
              "some-authority.some-id",
              START_TALLY,
              AUTHORITY_TYPE,
              "some-authority-id"
            ),
            {}
          );
          expect(wrapper.status).toEqual(TALLY);
        });
      });

      describe("when it receives any other message", () => {
        it("doesn't do anything", () => {
          wrapper.processMessage(
            MessageIdentifier.format(
              "some-authority.some-id",
              "some-type",
              TRUSTEE_TYPE,
              "some-author-id"
            ),
            {}
          );
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
          const response = wrapper.processMessage(
            MessageIdentifier.format(
              "some-authority.some-id",
              TALLY_CAST,
              BULLETIN_BOARD_TYPE,
              "some-bb-id"
            ),
            {
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
            }
          );
          expect(response).toEqual({
            content: `{"owner_id":"trustee-1","contests":{"question-1":{"q1-answer-1":${
              123 * 2
            },"q1-answer-2":${123 * 4}},"question-2":{"q2-answer-1":${
              123 * 3
            },"q2-answer-2":${123 * 5}}}}`,
            message_id: "some-authority.some-id.tally.share+t.trustee-1",
          });
        });
      });

      describe("when it receives the END_TALLY message", () => {
        it("returns some data", () => {
          const response = wrapper.processMessage(
            MessageIdentifier.format(
              "some-authority.some-id",
              END_TALLY,
              BULLETIN_BOARD_TYPE,
              "some-bb-id"
            ),
            {}
          );
          expect(wrapper.status).toEqual(TALLY_ENDED);
        });
      });
    });
  });

  describe("needsToBeRestored", () => {
    it("returns false when there aren't messages sent by the Trustee", () => {
      expect(wrapper.needsToBeRestored(null)).toBeFalsy();
    });

    it("returns false when the wrapper status is not the initial state", () => {
      wrapper.status = KEY_CEREMONY;
      expect(wrapper.needsToBeRestored(KEY_CEREMONY_STEP_1)).toBeFalsy();
    });

    it("returns true when the wrapper status is the initial state and there are messages sent by the Trustee", () => {
      expect(wrapper.needsToBeRestored(KEY_CEREMONY_STEP_1)).toBeTruthy();
    });
  });

  describe("backup", () => {
    it("returns a JSON representation of the wrapper", () => {
      expect(wrapper.backup()).toEqual(
        `{"trusteeId":"trustee-1","electionId":null,"status":${CREATED},"electionPublicKey":0}`
      );
    });

    describe("after creating the election keys", () => {
      beforeEach(() => {
        const response = wrapper.processMessage(
          MessageIdentifier.format(
            "some-authority.some-id",
            START_KEY_CEREMONY,
            AUTHORITY_TYPE,
            "some-authority-id"
          ),
          {}
        );
      });

      it("returns a JSON representation of the wrapper in the KEY_CEREMONY status", () => {
        expect(wrapper.backup()).toEqual(
          `{"trusteeId":"trustee-1","electionId":"some-authority.some-id","status":${KEY_CEREMONY},"electionPublicKey":${wrapper.electionPublicKey}}`
        );
      });
    });
  });

  describe("restore", () => {
    it("restore the state of the wrapper from a backup", () => {
      wrapper.status = KEY_CEREMONY;
      const backup = wrapper.backup();

      wrapper = buildTrusteeWrapper();
      expect(wrapper.status).toEqual(CREATED);
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
