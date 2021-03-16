import { MessageIdentifier } from "../message-identifier";

export class MessageParser {
  parse({ messageId, signedData }) {
    return {
      messageIdentifier: MessageIdentifier.parse(messageId),
      decodedData: signedData,
    };
  }
}
