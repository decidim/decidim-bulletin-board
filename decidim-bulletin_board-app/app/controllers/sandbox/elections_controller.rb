# frozen_string_literal: true

module Sandbox
  class ElectionsController < ApplicationController
    helper_method :elections, :election, :base_vote, :random_voter_id

    before_action :configure_bb_client

    def index; end

    def start_key_ceremony
      bulletin_board_client.start_key_ceremony(election_id)
      go_back
    end

    def key_ceremony; end

    def start_vote
      bulletin_board_client.start_vote(election_id)
      go_back
    end

    def vote
      return unless request.post?

      bulletin_board_client.cast_vote(election_id, params[:voter_id], params[:encrypted_ballot])
    end

    def end_vote
      bulletin_board_client.end_vote(election_id)
      go_back
    end

    def start_tally
      bulletin_board_client.start_tally(election_id)
      go_back
    end

    def tally; end

    def publish_results
      bulletin_board_client.publish_results(election_id)
      go_back
    end

    private

    delegate :authority, to: :election

    def go_back
      redirect_to sandbox_elections_path
    end

    def elections
      @elections ||= Election.order(:id)
    end

    def election
      @election ||= elections.find(params[:id])
    end

    def election_id
      @election_id ||= election.unique_id.split(".").last.to_i
    end

    def bulletin_board_client
      @bulletin_board_client = Decidim::BulletinBoard::Client.new
    end

    def configure_bb_client
      return unless params[:id]

      Decidim::BulletinBoard.configure do |config|
        config.server = "#{request.base_url}/api"
        config.api_key = authority.api_key
        config.scheme = "dummy"
        config.authority_name = authority.name
        config.number_of_trustees = 3
        config.identification_private_key = Test::PrivateKeys.authority_private_key_json
      end
    end

    def base_vote
      @base_vote ||= election.manifest[:description][:contests].map do |contest|
        [
          contest[:object_id],
          contest[:ballot_selections].sample(contest[:number_elected]).map { |ballot_selection| ballot_selection[:object_id] }
        ]
      end.to_h.to_json
    end

    def random_voter_id
      @random_voter_id ||= SecureRandom.hex
    end
  end
end
