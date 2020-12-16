export class Trustee {
  processLogEntry({ messageId, signedData }) {
    switch (messageId) {
      case "dummy.nothing": {
        return null;
      }
      case "dummy.send": {
        return {
          done: false,
          save: false,
          message: {
            message_id: messageId,
            content: signedData,
          },
        };
      }
      case "dummy.save": {
        return {
          done: false,
          save: true,
          message: {
            message_id: messageId,
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
