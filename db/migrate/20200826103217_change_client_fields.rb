# frozen_string_literal: true

class ChangeClientFields < ActiveRecord::Migration[6.0]
  def change
    add_index :clients, :name
    add_index :clients, :public_key
    add_index :clients, :api_key
    change_table :clients, bulk: true do |t|
      t.change :type, :string, null: false
      t.change :name, :text, unique: true, null: false
      t.change :public_key, :text, unique: true, null: false
      t.change :api_key, :text, unique: true, null: false
    end
  end
end
