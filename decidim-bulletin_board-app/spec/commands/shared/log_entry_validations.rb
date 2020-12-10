# frozen_string_literal: true

RSpec.shared_context "with a signed message" do
  let(:private_key) { generate(:private_key) }
  let(:signature_key) { private_key.keypair }
  let(:signed_data) { JWT.encode(payload.as_json, signature_key, "RS256") }
  let(:payload) { build(message_type, **message_params.merge(extra_message_params)) }
  let(:message_id) { payload["message_id"] }
  let(:message_params) { {} }
  let(:extra_message_params) { {} }
end

RSpec.shared_examples_for "with an invalid signed data" do |examples|
  context "when the message_id in the payload is different from the one in the signed message" do
    let(:message_id) { payload["message_id"] + "a" }

    it_behaves_like examples

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "The message identifier given doesn't match the signed data")
    end
  end

  context "when the signature is not right" do
    let(:signature_key) { generate(:private_key).keypair }

    it_behaves_like examples

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "Signature verification raised")
    end
  end

  context "when the signed_data format is invalid" do
    let(:signed_data) { "HOLAAMIGOTEQUIEROMUCHO" }

    it_behaves_like examples

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "Not enough or too many segments")
    end
  end

  context "when the iat is in the past" do
    let(:extra_message_params) { { iat: 1.day.ago.to_i } }

    it_behaves_like examples

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "Message is too old to be accepted")
    end
  end

  context "when the iat is in the future" do
    let(:extra_message_params) { { iat: 1.day.from_now.to_i } }

    it_behaves_like examples

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid iat")
    end
  end
end
