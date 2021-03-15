# frozen_string_literal: true

class FixEnums < ActiveRecord::Migration[6.0]
  def up
    change_table :elections, bulk: true do |t|
      t.remove :status
      t.integer :status, default: 0, null: false
    end

    change_table :pending_messages, bulk: true do |t|
      t.remove :status
      t.integer :status, default: 0, null: false
    end
  end

  def down
    change_table :elections, bulk: true do |t|
      t.remove :status
      t.string :status, null: false
    end

    change_table :pending_messages, bulk: true do |t|
      t.remove :status
      t.string :status, default: "0", null: false
    end
  end
end
