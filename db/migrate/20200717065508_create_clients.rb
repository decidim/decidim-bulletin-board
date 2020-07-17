class CreateClients < ActiveRecord::Migration[6.0]
  def change
    create_table :clients do |t|
      t.text :client_type
      t.text :key

      t.timestamps
    end
  end
end
