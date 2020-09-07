# frozen_string_literal: true

class CreateElections < ActiveRecord::Migration[6.0]
  def change
    create_table :trustees do |t|
      t.text :partial_key
      t.index :partial_key, unique: true
      t.timestamps
    end

    create_table :elections do |t|
      t.references :client, null: false, foreign_key: true
      t.string :title, null: false
      t.string :status, null: false
      t.index :title, unique: true
      t.timestamps
    end

    create_table :elections_trustees do |t|
      t.references :election, :trustee, null: false, foreign_key: true
      t.index [:election_id, :trustee_id], unique: true
      t.timestamps
    end

    create_table :log_entry do |t|
      t.references :election, null: false, foreign_key: true
      t.text :data, null: false
      t.text :hash, null: false
      t.string :type, null: false
      t.index :data, unique: true
      t.index :hash, unique: true
      t.timestamps
    end
  end
end
