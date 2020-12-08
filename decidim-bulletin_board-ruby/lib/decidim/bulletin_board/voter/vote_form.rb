# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Voter
      # A form object to handle some data transformation and validation to cast a vote.
      class VoteForm
        include ActiveModel::Validations

        validates :election_data, :voter_data, :encrypted_vote, presence: true
        validate :election_id_present
        validate :voter_id_present

        # Public: initialize the form
        #
        # bulletin_board_data - An instance of the bulletin board client
        # election_data - A Hash including the necessary data from the election.
        # voter_data - A Hash including the necessary data from the voter.
        # encrypted_vote - A Hash including the encrypted vote to cast
        def initialize(bulletin_board_client, election_data, voter_data, encrypted_vote)
          @bulletin_board_client = bulletin_board_client
          @election_data = election_data
          @voter_data = voter_data
          @encrypted_vote = encrypted_vote
        end

        # Public: returns a message identifier for the cast vote operation.
        def message_id
          @message_id ||= "#{election_id}.vote.cast+v.#{voter_id}"
        end

        # Public: uses the bulletin board client to sign the encrypted vote merged with the `message_id`.
        def signed_data
          @signed_data ||= bulletin_board_client.sign_data(encrypted_vote.merge(message_id: message_id))
        end

        private

        attr_reader :bulletin_board_client, :election_data, :voter_data, :encrypted_vote

        def election_id_present
          errors.add(:election_data, "doesn't include the election id") unless election_id.present?
        end

        def election_id
          return if election_data.blank?

          election_data[:election_id]
        end

        def voter_id_present
          errors.add(:voter_data, "doesn't include the voter id") unless voter_id.present?
        end

        def voter_id
          return if voter_data.blank?

          voter_data[:voter_id]
        end
      end
    end
  end
end
