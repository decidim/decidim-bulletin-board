# frozen_string_literal: true

class Authority < Client
  has_many :elections

  alias_attribute :slug, :unique_id

  def authority?
    true
  end
end
