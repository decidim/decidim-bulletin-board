# frozen_string_literal: true

module Types
  module MessageInterface
    include Types::BaseInterface

    field :id, ID, null: false
    field :election, Types::ElectionType, null: false
    field :client, Types::ClientType, null: false
    field :message_id, String, null: false
    field :signed_data, String, null: true
  end
end
