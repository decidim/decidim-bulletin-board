import { buildMessageId, parseMessageId } from "../../test-utils";

export class Trustee {
  processLogEntry({ messageId, signedData }) {
    const typeSubtype = parseMessageId(messageId);
    switch (typeSubtype) {
      case "dummy.nothing": {
        return null;
      }
      case "dummy.send": {
        return {
          done: false,
          cast: false,
          save: false,
          message: {
            message_id: buildMessageId("dummy.response_send"),
            content: signedData,
          },
        };
      }
      case "dummy.save": {
        return {
          done: false,
          cast: false,
          save: true,
          message: {
            message_id: buildMessageId("dummy.response_save"),
            content: signedData,
          },
        };
      }
      case "dummy.cast": {
        return {
          done: true,
          cast: true,
          save: false,
          message: {
            message_id: buildMessageId("dummy.response_cast"),
            content: signedData,
          },
        };
      }
      case "dummy.done": {
        return {
          done: true,
          cast: false,
          save: false,
          message: null,
        };
      }
    }
  }

  sign({ content }) {
    return content;
  }

  needsToBeRestored() {
    return true;
  }
}
