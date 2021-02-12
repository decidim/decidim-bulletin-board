import { buildMessageId } from "../../test-utils";

export class TrusteeWrapper {
  constructor({ trusteeId }) {
    this.trusteeId = trusteeId;
    this.keyCeremonyDone = false;
    this.tallyDone = false;
  }

  processMessage(messageIdentifier, message) {
    switch (messageIdentifier.typeSubtype) {
      case "dummy.send": {
        return {
          message_id: buildMessageId("dummy.response_send"),
          content: message,
        };
      }
      case "dummy.save": {
        return {
          message_id: buildMessageId("dummy.response_save"),
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
          message_id: buildMessageId("dummy.response_cast"),
          content: message,
        };
      }
    }
  }

  needsToBeRestored() {}

  backup() {}

  restore() {}

  isKeyCeremonyDone() {
    return this.keyCeremonyDone;
  }

  isTallyDone() {
    return this.tallyDone;
  }
}
