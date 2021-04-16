# frozen_string_literal: true

require "active_support/concern"

module ClientOrBulletinBoard
  extend ActiveSupport::Concern

  # we can change this to "prepended do ..." when Rails is updated to v6.1
  def self.prepended(base)
    base.class_eval do
      attr_accessor :bulletin_board

      validates :client, presence: true, unless: :bulletin_board

      after_find do
        @bulletin_board = true unless client_id
      end

      def client
        return BulletinBoard if @bulletin_board

        super
      end
    end
  end
end
