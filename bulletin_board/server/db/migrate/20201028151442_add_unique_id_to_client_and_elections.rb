# frozen_string_literal: true

class AddUniqueIdToClientAndElections < ActiveRecord::Migration[6.0]
  class Election < ApplicationRecord; end
  class Client < ApplicationRecord; end
  class Authority < Client; end
  class Trustee < Client; end

  def change
    change_table :elections, bulk: true do |t|
      t.remove_index :title
      t.string :unique_id
      t.index :unique_id, unique: true
    end

    Election.all.each { |election| election.update_attribute(:unique_id, election.title.parameterize) } # rubocop:disable Rails/SkipsModelValidations

    change_column_null(:elections, :unique_id, false)

    change_table :clients, bulk: true do |t|
      t.remove_index :name
      t.string :unique_id
      t.index :unique_id, unique: true
    end

    Client.all.each { |client| client.update_attribute(:unique_id, client.name.parameterize) } # rubocop:disable Rails/SkipsModelValidations

    change_column_null(:clients, :unique_id, false)
  end
end
