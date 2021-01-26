import { buildMessageId, parseMessageId } from "../../test-utils";

export class TrusteeWrapper {
  constructor({ trusteeId }) {
    this.trusteeId = trusteeId;
    this.keyCeremonyDone = false;
    this.tallyDone = false;
  }

  processMessage(messageId, signedData) {
    const typeSubtype = parseMessageId(messageId);
    switch (typeSubtype) {
      case "dummy.send": {
        return {
          message_id: buildMessageId("dummy.response_send"),
          content: signedData,
        };
      }
      case "dummy.save": {
        return {
          message_id: buildMessageId("dummy.response_save"),
          content: signedData,
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
          content: signedData,
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
