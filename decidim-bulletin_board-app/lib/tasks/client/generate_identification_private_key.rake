# frozen_string_literal: true

namespace :client do
  IDENTIFICATION_PRIVATE_KEY_SIZE = 4096

  desc "Generate the identification keys for this Bulletin Board instance to sign the published messages."

  task :generate_identification_private_key do
    jwk = JWT::JWK.new(OpenSSL::PKey::RSA.new(IDENTIFICATION_PRIVATE_KEY_SIZE))
    puts Decidim::BulletinBoard::JwkUtils.private_export(jwk).to_json
    puts
    puts "Above is the generated identification private key."
    puts
    puts "- You should copy it and store that value on the environment variable IDENTIFICATION_PRIVATE_KEY."
    puts
    puts "- Ensure that it is not lost between deployments and servers reboots, and that only can be accessed by the application."
    puts
  end
end
