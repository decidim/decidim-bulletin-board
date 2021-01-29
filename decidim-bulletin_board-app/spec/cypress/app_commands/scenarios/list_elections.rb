# frozen_string_literal: true

require "test/private_keys"

Authority.create!(
  name: "Decidim Test Authority",
  public_key: Test::PrivateKeys.authority_public_key,
  public_key_thumbprint: Decidim::BulletinBoard::JwkUtils.thumbprint(Test::PrivateKeys.authority_public_key),
  api_key: "89Ht70GZNcicu8WEyagz_rRae6brbqZAGuBEICYBCii-PTV3MAstAtx1aRVe5H5YfODi-JgYPvyf9ZMH7tOeZ15e3mf9B2Ymgw7eknvBFMRP213YFGo1SPn_C4uLK90G"
)

elections = FactoryBot.create_list(:election, 3)

{
  elections: elections
}
