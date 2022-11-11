# frozen_string_literal: true

class AddVotingSchemaStateToElections < ActiveRecord::Migration[6.1]
  def change
    add_column :elections, :voting_scheme_state, :binary, null: true
  end
end
