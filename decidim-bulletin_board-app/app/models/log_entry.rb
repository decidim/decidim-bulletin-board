# frozen_string_literal: true

class LogEntry < ApplicationRecord
  prepend ClientOrBulletinBoard

  belongs_to :election
  belongs_to :client, optional: true

  before_create do
    self.content_hash = Digest::SHA256.hexdigest(content) if content
    self.chained_hash = Digest::SHA256.hexdigest([previous_hash, decoded_data].join("."))
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
    election.log_entries.last&.chained_hash || election.unique_id
  end
end
