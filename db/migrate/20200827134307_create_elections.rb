# frozen_string_literal: true

class CreateElections < ActiveRecord::Migration[6.0]
  def change
    create_table :elections do |t|
      t.references :authority, null: false, foreign_key: { to_table: :clients }
      t.string :title, null: false
      t.string :status, null: false
      t.index :title, unique: true
      t.timestamps
    end

    create_table :elections_trustees do |t|
      t.references :election, null: false, foreign_key: true
      t.references :trustee, null: false, foreign_key: { to_table: :clients }
      t.index [:election_id, :trustee_id], unique: true
      t.timestamps
    end

    create_table :log_entries do |t|
      t.references :election, null: false, foreign_key: true
      t.text :signed_data, null: false
      t.text :chained_hash, null: false
      t.string :log_type, null: false
      t.index :signed_data, unique: true
      t.index :chained_hash, unique: true
      t.timestamps
    end
  end
end
