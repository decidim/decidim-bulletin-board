# frozen_string_literal: true

class FixClientsPublicKey < ActiveRecord::Migration[6.0]
  def up
    change_table :clients, bulk: true do |t|
      t.change :public_key, "jsonb USING public_key::jsonb"
      t.string :public_key_thumbprint
      t.index :public_key_thumbprint, unique: true
    end
  end

  def down
    change_table :clients, bulk: true do |t|
      t.remove_index :public_key_thumbprint
      t.remove :public_key_thumbprint
      t.change :public_key, :text
    end
  end
end
