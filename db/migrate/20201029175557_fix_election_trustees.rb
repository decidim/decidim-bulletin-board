# frozen_string_literal: true

class FixElectionTrustees < ActiveRecord::Migration[6.0]
  def change
    rename_table :elections_trustees, :election_trustees
  end
end
