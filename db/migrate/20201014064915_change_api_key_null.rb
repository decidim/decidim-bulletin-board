# frozen_string_literal: true

class ChangeApiKeyNull < ActiveRecord::Migration[6.0]
  def change
    change_column_null :clients, :api_key, true
  end
end
