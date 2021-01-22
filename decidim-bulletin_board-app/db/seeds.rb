# frozen_string_literal: true

exit if Rails.env.production? && !ENV["SEED"]

require "factory_bot_rails"
require "test/private_keys"

def create_key_ceremony_log_entries(election)
  Trustee.first(3).zip(Test::PrivateKeys.trustees_private_keys).each do |trustee, private_key|
    FactoryBot.create(:log_entry,
                      election: election,
                      client: trustee,
                      private_key: private_key,
                      message: FactoryBot.build(:key_ceremony_message,
                                                election: election,
                                                trustee: trustee))
  end
end

def create_joint_election_key_log_entry(election)
  FactoryBot.create(:log_entry,
                    :by_bulletin_board,
                    election: election,
                    message: FactoryBot.build(:key_ceremony_message_joint_election_message,
                                              election: election))
end

def create_open_ballot_box_log_entry(election)
  FactoryBot.create(:log_entry,
                    election: election,
                    message: FactoryBot.build(:open_ballot_box_message,
                                              election: election))
end

def create_vote_log_entries(election, amount = 3)
  amount.times do
    FactoryBot.create(:log_entry,
                      election: election,
                      message: FactoryBot.build(:vote_message,
                                                election: election))
  end
end

def create_close_ballot_box_log_entry(election)
  FactoryBot.create(:log_entry,
                    election: election,
                    message: FactoryBot.build(:close_ballot_box_message,
                                              election: election))
end

def create_start_tally_log_entry(election)
  FactoryBot.create(:log_entry,
                    election: election,
                    message: FactoryBot.build(:start_tally_message,
                                              election: election))
end

def create_tally_log_entries(election)
  Trustee.first(3).zip(Test::PrivateKeys.trustees_private_keys).each do |trustee, private_key|
    FactoryBot.create(:log_entry,
                      election: election,
                      client: trustee,
                      private_key: private_key,
                      message: FactoryBot.build(:tally_share_message,
                                                election: election,
                                                trustee: trustee))
  end
end

def create_end_tally_log_entry(election)
  FactoryBot.create(:log_entry,
                    :by_bulletin_board,
                    election: election,
                    message: FactoryBot.build(:end_tally_message,
                                              election: election))
end

def create_publish_results_log_entry(election)
  FactoryBot.create(:log_entry,
                    election: election,
                    message: FactoryBot.build(:publish_results_message,
                                              election: election))
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
    public_key: trustee_public_key,
    public_key_thumbprint: Decidim::BulletinBoard::JwkUtils.thumbprint(trustee_public_key)
  )
end

TEST_ELECTION_ID_OFFSET = 10_000
[:key_ceremony, :ready, :vote, :vote_ended, :tally, :tally_ended, :results_published].each_with_index do |status, i|
  election = FactoryBot.create(:election, status, election_id: TEST_ELECTION_ID_OFFSET + i)

  case status
  when :ready
    create_key_ceremony_log_entries(election)
    create_joint_election_key_log_entry(election)
  when :vote
    create_key_ceremony_log_entries(election)
    create_joint_election_key_log_entry(election)
    create_open_ballot_box_log_entry(election)
  when :vote_ended
    create_key_ceremony_log_entries(election)
    create_joint_election_key_log_entry(election)
    create_open_ballot_box_log_entry(election)
    create_vote_log_entries(election)
    create_close_ballot_box_log_entry(election)
  when :tally
    create_key_ceremony_log_entries(election)
    create_joint_election_key_log_entry(election)
    create_open_ballot_box_log_entry(election)
    create_vote_log_entries(election)
    create_close_ballot_box_log_entry(election)
    create_start_tally_log_entry(election)
  when :tally_ended
    create_key_ceremony_log_entries(election)
    create_joint_election_key_log_entry(election)
    create_open_ballot_box_log_entry(election)
    create_vote_log_entries(election)
    create_close_ballot_box_log_entry(election)
    create_start_tally_log_entry(election)
    create_tally_log_entries(election)
    create_end_tally_log_entry(election)
  when :results_published
    create_key_ceremony_log_entries(election)
    create_joint_election_key_log_entry(election)
    create_open_ballot_box_log_entry(election)
    create_vote_log_entries(election)
    create_close_ballot_box_log_entry(election)
    create_start_tally_log_entry(election)
    create_tally_log_entries(election)
    create_end_tally_log_entry(election)
    create_publish_results_log_entry(election)
  end
end
