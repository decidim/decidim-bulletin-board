# frozen_string_literal: true

class CreatePendingMessages < ActiveRecord::Migration[6.1]
  def change
    create_table :pending_messages do |t|
      t.references :election, null: true
      t.references :client, null: false
      t.text :signed_data, null: false
      t.string :status, null: false, default: 0

      t.timestamps
    end
  end
end
