# frozen_string_literal: true

class LogEntry < ApplicationRecord
  prepend ClientOrBulletinBoard
  include Message

  belongs_to :election
  belongs_to :client, optional: true

  before_create do
    self.content_hash = Digest::SHA256.hexdigest(content) if content
    self.chained_hash = Digest::SHA256.hexdigest([previous_hash, signed_data].join("."))
    self.iat = decoded_data[:iat]
    self.message_type = message_identifier.type
    self.message_subtype = message_identifier.subtype
    self.author_unique_id = message_identifier.author_id
  end

  def decoded_data
    @decoded_data ||= begin
      JWT.decode(signed_data, client.public_key_rsa, true, verify_iat: true, algorithm: "RS256").first.with_indifferent_access
    rescue JWT::VerificationError, JWT::DecodeError, JWT::InvalidIatError, JWT::InvalidPayload => e
      { error: e.message }
    end
  end

  def content
    @content ||= decoded_data[:content]
  end

  def previous_hash
    LogEntry.where(election: election).order(id: :desc).pick(:chained_hash) || election.unique_id
  end
end
