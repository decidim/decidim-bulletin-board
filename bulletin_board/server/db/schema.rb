# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_04_13_125626) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", null: false
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "clients", force: :cascade do |t|
    t.string "type", null: false
    t.text "name", null: false
    t.jsonb "public_key", null: false
    t.text "api_key"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "unique_id", null: false
    t.string "public_key_thumbprint"
    t.index ["api_key"], name: "index_clients_on_api_key", unique: true
    t.index ["public_key"], name: "index_clients_on_public_key", unique: true
    t.index ["public_key_thumbprint"], name: "index_clients_on_public_key_thumbprint", unique: true
    t.index ["unique_id"], name: "index_clients_on_unique_id", unique: true
  end

  create_table "election_trustees", force: :cascade do |t|
    t.bigint "election_id", null: false
    t.bigint "trustee_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["election_id", "trustee_id"], name: "index_election_trustees_on_election_id_and_trustee_id", unique: true
    t.index ["election_id"], name: "index_election_trustees_on_election_id"
    t.index ["trustee_id"], name: "index_election_trustees_on_trustee_id"
  end

  create_table "elections", force: :cascade do |t|
    t.bigint "authority_id", null: false
    t.jsonb "title", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "unique_id", null: false
    t.binary "voting_scheme_state"
    t.integer "status", default: 0, null: false
    t.string "verifiable_results_hash"
    t.index ["authority_id"], name: "index_elections_on_authority_id"
    t.index ["unique_id"], name: "index_elections_on_unique_id", unique: true
  end

  create_table "log_entries", force: :cascade do |t|
    t.bigint "election_id", null: false
    t.bigint "client_id"
    t.text "signed_data", null: false
    t.string "chained_hash", null: false
    t.string "message_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "content_hash"
    t.integer "iat", null: false
    t.string "author_unique_id", null: false
    t.string "message_type", null: false
    t.string "message_subtype"
    t.index ["chained_hash"], name: "index_log_entries_on_chained_hash", unique: true
    t.index ["client_id"], name: "index_log_entries_on_client_id"
    t.index ["content_hash"], name: "index_log_entries_on_content_hash"
    t.index ["election_id", "message_type", "message_subtype", "author_unique_id"], name: "index_log_entries_on_type_subtype_author"
    t.index ["election_id"], name: "index_log_entries_on_election_id"
    t.index ["iat"], name: "index_log_entries_on_iat"
  end

  create_table "pending_messages", force: :cascade do |t|
    t.bigint "election_id", null: false
    t.bigint "client_id", null: false
    t.text "signed_data", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "message_id", null: false
    t.integer "status", default: 0, null: false
    t.index ["client_id"], name: "index_pending_messages_on_client_id"
    t.index ["election_id"], name: "index_pending_messages_on_election_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "election_trustees", "clients", column: "trustee_id"
  add_foreign_key "election_trustees", "elections"
  add_foreign_key "elections", "clients", column: "authority_id"
  add_foreign_key "log_entries", "clients"
  add_foreign_key "log_entries", "elections"
end
