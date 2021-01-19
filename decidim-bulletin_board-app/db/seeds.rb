# frozen_string_literal: true

exit if Rails.env.production? && !ENV["SEED"]

require "factory_bot_rails"
require "test/private_keys"

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
  FactoryBot.create(:election, election_id: TEST_ELECTION_ID_OFFSET + i, status: status)
end
