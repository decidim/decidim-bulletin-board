# frozen_string_literal: true

class MessageIdentifier
  def initialize(message_id)
    @message_id = message_id
  end

  def from_authority?
    author_type == :authority
  end

  def from_trustee?
    author_type == :trustee
  end

  def author_type
    @author_type ||= AUTHOR_TYPE[author.first.to_sym]
  end

  def author_id
    @author_id ||= author.last
  end

  def authority_id
    @authority_id ||= elements[0]
  end

  def election_id
    @election_id = elements[0..1].join(".")
  end

  def type
    @type = elements[2]
  end

  def subtype
    @subtype = elements[3]
  end

  def to_s
    @message_id
  end

  private

  attr_accessor :message_id

  AUTHOR_TYPE = {
    a: :authority,
    b: :bulletin_board,
    t: :trustee,
    v: :voter
  }.freeze

  def elements
    @elements ||= parts.first.split(".", 4)
  end

  def author
    @author ||= parts.last.split(".", 2)
  end

  def parts
    @parts ||= message_id.split("+")
  end
end
