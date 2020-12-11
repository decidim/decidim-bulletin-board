export class Trustee {
  processLogEntry({ messageId, signedData }) {
    switch (messageId) {
      case "dummy.nothing": {
        return null;
      }
      case "dummy.step": {
        return {
          done: false,
          message: {
            message_id: messageId,
            content: signedData,
          },
        };
      }
      case "dummy.done": {
        return {
          done: true,
          message: {
            message_id: messageId,
            content: signedData,
          },
        };
      }
    }
  }

  sign({ content }) {
    return content;
  }
}
