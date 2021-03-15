import { AUTHORITY_TYPE } from "./client/message-identifier";

export function buildMessageIdentifier(typeSubtype) {
  const [type, subtype] = typeSubtype.split(".");

  return {
    electionId: "decidim-barcelona.1",
    type: type,
    subtype: subtype,
    typeSubtype: typeSubtype,
    author: {
      type: AUTHORITY_TYPE,
      id: "decidim-barcelona",
    },
  };
}

export function buildMessageId(typeSubtype) {
  return `decidim-barcelona.1.${typeSubtype}+t.trustee-1`;
}

export class TrusteeWrapperAdapter {
  constructor({ trusteeId }) {
    this.trusteeId = trusteeId;
    this.keyCeremonyDone = false;
    this.tallyDone = false;
  }

  setup() {}

  processMessage(messageType, message) {
    switch (messageType) {
      case "dummy.send": {
        return {
          messageType: "dummy.response_send",
          content: message,
        };
      }
      case "dummy.save": {
        return {
          messageType: "dummy.response_save",
          content: message,
        };
      }
      case "dummy.done": {
        this.keyCeremonyDone = true;
        break;
      }
      case "dummy.cast": {
        this.tallyDone = true;
        return {
          messageType: "dummy.response_cast",
          content: message,
        };
      }
    }
  }

  isFresh() {}

  backup() {}

  restore() {}

  isKeyCeremonyDone() {
    return this.keyCeremonyDone;
  }

  isTallyDone() {
    return this.tallyDone;
  }
}

export class VoterWrapperAdapter {
  constructor({ voterId }) {
    this.voterId = voterId;
  }

  setup() {}

  processMessage(messageType, message) {}

  encrypt(plainVote) {}
}
