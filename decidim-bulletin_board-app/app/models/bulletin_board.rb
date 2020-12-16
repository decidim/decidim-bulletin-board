# frozen_string_literal: true

class BulletinBoard
  include ActiveModel::Model

  class << self
    include HasPublicKey

    def class
      self
    end

    def instance
      self
    end

    def primary_key
      :id
    end

    def id
      0
    end

    def readonly?
      true
    end

    def persisted?
      true
    end

    def _read_attribute(attr)
      return id if attr == :id

      nil
    end

    def polymorphic_name
      name
    end

    def destroyed?
      false
    end

    def new_record?
      false
    end

    def type
      "BulletinBoard"
    end

    def public_key
      private_key&.export
    end

    def public_key_thumbprint
      JwkUtils.thumbprint(public_key)
    end

    def name
      "Bulletin Board"
    end

    def bulletin_board?
      true
    end

    def unique_id
      name.parameterize
    end

    def configured?
      private_key.present?
    end

    def sign(message)
      JWT.encode(message, private_key.keypair, "RS256")
    end

    private

    def new; end

    def private_key
      @private_key ||= JwkUtils.import_private_key(Rails.application.secrets.identification_private_key)
    end
  end
end
