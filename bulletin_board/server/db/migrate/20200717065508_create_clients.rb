# frozen_string_literal: true

class CreateClients < ActiveRecord::Migration[6.1]
  def change
    create_table :clients do |t|
      t.string :type
      t.text :name, unique: true
      t.text :public_key, unique: true
      t.text :api_key, unique: true

      t.timestamps
    end
  end
end
