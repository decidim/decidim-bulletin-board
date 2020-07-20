class CreateClients < ActiveRecord::Migration[6.0]
  def change
    create_table :clients do |t|
      t.string :type
      t.text :name, unique: true
      t.text :key, unique: true

      t.timestamps
    end
  end
end
