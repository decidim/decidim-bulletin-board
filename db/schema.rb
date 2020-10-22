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

ActiveRecord::Schema.define(version: 20_201_022_122_359) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "clients", force: :cascade do |t|
    t.string "type", null: false
    t.text "name", null: false
    t.text "public_key", null: false
    t.text "api_key"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["api_key"], name: "index_clients_on_api_key", unique: true
    t.index ["name"], name: "index_clients_on_name", unique: true
    t.index ["public_key"], name: "index_clients_on_public_key", unique: true
  end

  create_table "elections", force: :cascade do |t|
    t.bigint "authority_id", null: false
    t.string "title", null: false
    t.string "status", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["authority_id"], name: "index_elections_on_authority_id"
    t.index ["title"], name: "index_elections_on_title", unique: true
  end

  create_table "elections_trustees", force: :cascade do |t|
    t.bigint "election_id", null: false
    t.bigint "trustee_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index %w(election_id trustee_id), name: "index_elections_trustees_on_election_id_and_trustee_id", unique: true
    t.index ["election_id"], name: "index_elections_trustees_on_election_id"
    t.index ["trustee_id"], name: "index_elections_trustees_on_trustee_id"
  end

  create_table "log_entries", force: :cascade do |t|
    t.bigint "election_id", null: false
    t.bigint "client_id", null: false
    t.text "signed_data", null: false
    t.text "chained_hash", null: false
    t.string "log_type", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["chained_hash"], name: "index_log_entries_on_chained_hash", unique: true
    t.index ["client_id"], name: "index_log_entries_on_client_id"
    t.index ["election_id"], name: "index_log_entries_on_election_id"
  end

  add_foreign_key "elections", "clients", column: "authority_id"
  add_foreign_key "elections_trustees", "clients", column: "trustee_id"
  add_foreign_key "elections_trustees", "elections"
  add_foreign_key "log_entries", "clients"
  add_foreign_key "log_entries", "elections"
end
