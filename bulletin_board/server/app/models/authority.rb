# frozen_string_literal: true

class Authority < Client
  has_many :elections

  def authority?
    true
  end
end
