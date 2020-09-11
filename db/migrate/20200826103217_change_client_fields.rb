# frozen_string_literal: true

class ChangeClientFields < ActiveRecord::Migration[6.0]
  def up
    add_index :clients, :name, unique: true
    add_index :clients, :public_key, unique: true
    add_index :clients, :api_key, unique: true
    change_table :clients, bulk: true do |t|
      t.change :type, :string, null: false
      t.change :name, :text, null: false
      t.change :public_key, :text, null: false
      t.change :api_key, :text, null: false
    end
  end

  def down
    remove_index :clients, :name
    remove_index :clients, :public_key
    remove_index :clients, :api_key
    change_table :clients, bulk: true do |t|
      t.change :type, :string, null: true
      t.change :name, :text, null: true
      t.change :public_key, :text, null: true
      t.change :api_key, :text, null: true
    end
  end
end
