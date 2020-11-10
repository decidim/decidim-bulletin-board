# frozen_string_literal: true

exit if Rails.env.production?

base_path = File.expand_path("seeds", __dir__)
$LOAD_PATH.push base_path

require "factory_bot_rails"
require "jwk_utils"
require "private_keys"

dev_private_key = JwkUtils.import_private_key(PrivateKeys.dev_private_key_json)
dev_public_key = dev_private_key.export

dev_authority = Authority.create!(
  name: "Decidim Test Authority",
  public_key: dev_public_key,
  public_key_thumbprint: JwkUtils.thumbprint(dev_public_key),
  api_key: "89Ht70GZNcicu8WEyagz_rRae6brbqZAGuBEICYBCii-PTV3MAstAtx1aRVe5H5YfODi-JgYPvyf9ZMH7tOeZ15e3mf9B2Ymgw7eknvBFMRP213YFGo1SPn_C4uLK90G"
)

dev_trustees_private_keys = PrivateKeys.dev_trustees_private_keys_json.map { |trustee_private_key_json| JwkUtils.import_private_key(trustee_private_key_json) }

dev_trustees = dev_trustees_private_keys.each_with_index.map do |trustee_private_key, index|
  trustee_public_key = trustee_private_key.export

  Trustee.create!(
    name: "Decidim Test Trustee #{index + 1}",
    public_key: trustee_public_key,
    public_key_thumbprint: JwkUtils.thumbprint(trustee_public_key)
  )
end

FactoryBot.create(:election, authority: dev_authority, authority_private_key: dev_private_key, trustees_plus_keys: dev_trustees.zip(dev_trustees_private_keys))
