class AddNameToClient < ActiveRecord::Migration[6.0]
  def change
    add_column :clients, :name, :text
  end
end
