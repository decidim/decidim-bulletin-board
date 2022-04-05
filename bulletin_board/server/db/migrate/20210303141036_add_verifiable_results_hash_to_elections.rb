# frozen_string_literal: true

class AddVerifiableResultsHashToElections < ActiveRecord::Migration[6.1]
  def change
    add_column :elections, :verifiable_results_hash, :string
  end
end
