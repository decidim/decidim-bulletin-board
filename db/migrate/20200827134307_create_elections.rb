# frozen_string_literal: true

class CreateElections < ActiveRecord::Migration[6.0]
  def change
    create_table :elections do |t|
      t.references :client, null: false, foreign_key: true, index: true
      t.boolean :open, default: false

      t.timestamps
    end
  end
end
