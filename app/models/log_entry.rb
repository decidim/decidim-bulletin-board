# frozen_string_literal: true

class LogEntry < ApplicationRecord
  belongs_to :election
  belongs_to :client

  def decoded_data
    @decoded_data ||= begin
                        JWT.decode(signed_data, client.rsa_public_key, true, algorithm: "RS256").first
                      rescue JWT::DecodeError => e
                        { error: e.message }
                      end
  end
end
