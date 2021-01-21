# frozen_string_literal: true

exit if Rails.env.production? && !ENV["SEED"]

require "factory_bot_rails"
require "test/private_keys"

def create_key_ceremony_log_entries(election)
  Test::PrivateKeys.trustees_private_keys.each_with_index do |trustee_private_key, index|
    trustee = Trustee.find_by(name: "Decidim Test Trustee #{index + 1}")
    FactoryBot.create(:log_entry,
                      election: election,
                      client: trustee,
                      private_key: trustee_private_key,
                      message: FactoryBot.build(:key_ceremony_message,
                                                election: election,
                                                trustee: trustee))
  end
end

def create_joint_election_key_log_entry(election)
  FactoryBot.create(:log_entry,
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
[:key_ceremony, :ready, :vote, :tally, :results, :results_published].each_with_index do |status, i|
  election = FactoryBot.create(:election, election_id: TEST_ELECTION_ID_OFFSET + i, status: status)

  case status
  when :ready
    create_key_ceremony_log_entries(election)
    create_joint_election_key_log_entry(election)
  when :vote
    create_key_ceremony_log_entries(election)
    create_joint_election_key_log_entry(election)
    create_open_ballot_box_log_entry(election)
  when :tally
    create_key_ceremony_log_entries(election)
    create_joint_election_key_log_entry(election)
    create_open_ballot_box_log_entry(election)
    create_vote_log_entries(election)
    create_close_ballot_box_log_entry(election)
  when :results
    create_key_ceremony_log_entries(election)
    create_joint_election_key_log_entry(election)
    create_open_ballot_box_log_entry(election)
    create_vote_log_entries(election)
    create_close_ballot_box_log_entry(election)
  when :results_published
    create_key_ceremony_log_entries(election)
    create_joint_election_key_log_entry(election)
    create_open_ballot_box_log_entry(election)
    create_vote_log_entries(election)
    create_close_ballot_box_log_entry(election)
  end
end
