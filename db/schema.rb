# frozen_string_literal: true

# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20_200_827_134_307) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "clients", force: :cascade do |t|
    t.string "type", null: false
    t.text "name", null: false
    t.text "public_key", null: false
    t.text "api_key", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["api_key"], name: "index_clients_on_api_key", unique: true
    t.index ["name"], name: "index_clients_on_name", unique: true
    t.index ["public_key"], name: "index_clients_on_public_key", unique: true
  end

  create_table "elections", force: :cascade do |t|
    t.bigint "client_id", null: false
    t.boolean "open", default: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["client_id"], name: "index_elections_on_client_id"
  end

  add_foreign_key "elections", "clients"
end
