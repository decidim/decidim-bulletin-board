# frozen_string_literal: true

module Types
  class ElectionType < Types::BaseObject
    field :id, ID, null: false
    field :title, String, null: false
    field :status, String, null: false
    field :authority_id, String, null: false
  end
end
