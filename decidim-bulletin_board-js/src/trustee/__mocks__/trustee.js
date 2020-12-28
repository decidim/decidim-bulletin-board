import { buildMessageId } from "../../test-utils";

export class Trustee {
  processLogEntry({ messageId, signedData }) {
    const typeSubtype = messageId
      .split("+")[0]
      .split(".", 4)
      .slice(2, 4)
      .join(".");
    switch (typeSubtype) {
      case "dummy.nothing": {
        return null;
      }
      case "dummy.send": {
        return {
          done: false,
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
          save: true,
          message: {
            message_id: buildMessageId("dummy.response_save"),
            content: signedData,
          },
        };
      }
      case "dummy.done": {
        return {
          done: true,
          save: false,
          message: null,
        };
      }
    }
  }

  sign({ content }) {
    return content;
  }

  checkRestoreNeeded(_messageId) {
    return false;
  }
}
