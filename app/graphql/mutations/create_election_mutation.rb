# frozen_string_literal: true

module Mutations
  class CreateElectionMutation < GraphQL::Schema::Mutation
    argument :signed_data, String, required: true
    argument :api_key, String, required: true

    field :election, Types::ElectionType, null: true
    field :error, String, null: true
    def resolve(signed_data:, api_key:)
      authority = get_authority(api_key)
      return { error: "Authority not found" } unless authority

      json_data = decode_signed_data(signed_data, authority.public_key)
      chained_hash = Digest::SHA256.hexdigest(signed_data)
      election_form = ElectionForm.new(title: get_title(json_data), status: "Published", authority: authority,
                                       signed_data: signed_data,
                                       chained_hash: chained_hash, log_type: "createElection")
      CreateElection.call(election_form) do
        on(:ok) do |election|
          return { election: election }
        end
        on(:invalid) do |error|
          return { error: error }
        end
      end
    end

    def get_authority(api_key)
      Authority.find_by(api_key: api_key)
    end

    def decode_signed_data(signed_data, public_key)
      rsa_public_key = OpenSSL::PKey::RSA.new(public_key)
      JWT.decode signed_data, rsa_public_key, false, algorithm: "RS256"
    end

    def get_title(json_data)
      json_data[0]["description"]["name"]["text"][0]["value"]
    end
  end
end
