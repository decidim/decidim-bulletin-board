
/**
 * This is a class that handles message id strings.
 */
export class MessageIdentifier {
  AUTHORITY_TYPE = "a"
  BULLETIN_BOARD_TYPE = "b"
  VOTER_TYPE = "v"
  TRUSTEE_TYPE = "t"
  VALID_TYPES = [AUTHORITY_TYPE, BULLETIN_BOARD_TYPE, VOTER_TYPE, TRUSTEE_TYPE]

  /**
   * Parses a message id string into a JS object.
   *
   * @param {String} messageId - A string with a message id.
   * @returns {Object} - An object with the message id values.
   */
  static parse(messageId) {
    [elements, author] = messageId.split("+")
    [authority, electionId, type, subtype] = split(".", 4)
    [authorType, authorId] = author.split(".", 2)

    if (!VALID_TYPES.includes(authorType))
    {
      throw new Error("Invalid message identifier format");
    }

    return {
      electionId: `${authority}.${electionId}`,
      type,
      subtype,
      type_subtype: `${type}.${subtype}`,
      author: {
        type: authorType,
        id: authorId
      }
    }
  }

  static format(electionId, type_subtype, authorType, authorId){
    return `${electionId}.${type_subtype}+${authorType}.${authorId}`
  }
}