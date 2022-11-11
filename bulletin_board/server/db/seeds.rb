# frozen_string_literal: true

exit if Rails.env.production? && !ENV["SEED"]

require "factory_bot_rails"
require "test/private_keys"

def create_start_key_ceremony_log_entry(election)
  FactoryBot.create(:log_entry,
                    election:,
                    message: FactoryBot.build(:start_key_ceremony_message,
                                              election:))
end

def create_key_ceremony_log_entries(election)
  Trustee.first(3).zip(Test::PrivateKeys.trustees_private_keys, Test::Elections.trustees_election_keys).each do |trustee, private_key, election_key|
    FactoryBot.create(:log_entry,
                      election:,
                      client: trustee,
                      private_key:,
                      message: FactoryBot.build(:key_ceremony_message,
                                                election_public_key: election_key,
                                                election:,
                                                trustee:))
  end
end

def create_end_key_ceremony_log_entry(election)
  FactoryBot.create(:log_entry,
                    :by_bulletin_board,
                    election:,
                    message: FactoryBot.build(:end_key_ceremony_message,
                                              election:))
end

def create_start_vote_log_entry(election)
  FactoryBot.create(:log_entry,
                    election:,
                    message: FactoryBot.build(:start_vote_message,
                                              election:))
end

def create_vote_log_entries(election, amount = 3)
  amount.times do
    vote_message = FactoryBot.build(:vote_message, election:)
    FactoryBot.create(:pending_message, :accepted, election:, message: vote_message)
    FactoryBot.create(:log_entry, election:, message: vote_message)
  end
end

def create_end_vote_log_entry(election)
  FactoryBot.create(:log_entry,
                    election:,
                    message: FactoryBot.build(:end_vote_message,
                                              election:))
end

def create_start_tally_log_entries(election)
  FactoryBot.create(:log_entry,
                    election:,
                    message: FactoryBot.build(:start_tally_message,
                                              election:))
  FactoryBot.create(:log_entry,
                    :by_bulletin_board,
                    election:,
                    message: FactoryBot.build(:tally_cast_message,
                                              election:))
end

def create_tally_log_entries(election)
  Trustee.first(3).zip(Test::PrivateKeys.trustees_private_keys, Test::Elections.trustees_election_keys).each do |trustee, private_key, election_key|
    FactoryBot.create(:log_entry,
                      election:,
                      client: trustee,
                      private_key:,
                      message: FactoryBot.build(:tally_share_message,
                                                election_public_key: election_key,
                                                election:,
                                                trustee:))
  end
end

def create_end_tally_log_entry(election)
  FactoryBot.create(:log_entry,
                    :by_bulletin_board,
                    election:,
                    message: FactoryBot.build(:end_tally_message,
                                              election:))
end

def create_publish_results_log_entry(election)
  FactoryBot.create(:log_entry,
                    election:,
                    message: FactoryBot.build(:publish_results_message,
                                              election:))
end

Authority.create!(
  name: "Decidim Test Authority",
  public_key: Test::PrivateKeys.authority_public_key,
  public_key_thumbprint: Decidim::BulletinBoard::JwkUtils.thumbprint(Test::PrivateKeys.authority_public_key),
  api_key: "89Ht70GZNcicu8WEyagz_rRae6brbqZAGuBEICYBCii-PTV3MAstAtx1aRVe5H5YfODi-JgYPvyf9ZMH7tOeZ15e3mf9B2Ymgw7eknvBFMRP213YFGo1SPn_C4uLK90G"
)

Test::PrivateKeys.trustees_public_keys.each_with_index.map do |trustee_public_key, index|
  Trustee.create!(
    name: "Decidim Test Trustee #{index + 1}",
    unique_id: "decidim-test-authority.decidim-test-trustee-#{index + 1}",
    public_key: trustee_public_key,
    public_key_thumbprint: Decidim::BulletinBoard::JwkUtils.thumbprint(trustee_public_key)
  )
end

TEST_ELECTION_ID_OFFSET = 10_000
[:created, :key_ceremony, :key_ceremony_ended, :vote, :vote_ended, :tally_started, :tally_ended, :results_published].each_with_index do |status, i|
  election = FactoryBot.create(:election, status, election_id: TEST_ELECTION_ID_OFFSET + i)

  next if status == :created

  create_start_key_ceremony_log_entry(election)
  next if status == :key_ceremony

  create_key_ceremony_log_entries(election)
  create_end_key_ceremony_log_entry(election)
  next if status == :key_ceremony_ended

  create_start_vote_log_entry(election)
  next if status == :vote

  create_vote_log_entries(election)
  create_end_vote_log_entry(election)
  next if status == :vote_ended

  create_start_tally_log_entries(election)
  next if status == :tally_started

  create_tally_log_entries(election)
  create_end_tally_log_entry(election)
  next if status == :tally_ended

  create_publish_results_log_entry(election)
end
