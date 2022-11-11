# frozen_string_literal: true

class ChangeElectionsTitleType < ActiveRecord::Migration[6.1]
  def change
    change_column :elections, :title, "jsonb USING title::jsonb"
  end
end
