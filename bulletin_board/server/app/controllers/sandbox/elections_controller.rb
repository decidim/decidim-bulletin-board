# frozen_string_literal: true

require "test/private_keys"

module Sandbox
  class ElectionsController < ApplicationController
    helper_method :elections, :election,
                  :bulletin_board_server, :authority_slug, :authority_public_key,
                  :random_voter_id,
                  :election_results, :verifiable_results,
                  :default_bulk_votes_number, :bulk_votes_file_name, :bulk_votes_file_exists?, :generated_votes_number,
                  :pending_message

    DEFAULT_BULK_VOTES_NUMBER = 1000

    def index; end

    def create
      bulletin_board_client.create_election(params[:election][:id], election_data)
      go_back
    end

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

      pending_message = bulletin_board_client.cast_vote(election_id, params[:voter_id], params[:encrypted_ballot])

      render json: pending_message.to_json
    end

    def in_person_vote
      return unless request.post?

      @pending_message = bulletin_board_client.in_person_vote(election_id, params[:voter_id], params[:polling_station_id])
    end

    def generate_bulk_votes
      delete_bulk_votes_file(election)

      GenerateVotesJob.perform_later(number_of_votes_to_generate, election.id, bulk_votes_file_path(election), bulletin_board_settings_hash)
    end

    def download_bulk_votes
      return head(:not_foud) unless bulk_votes_file_exists?(election)

      send_file(
        bulk_votes_file_path(election),
        filename: bulk_votes_file_name(election),
        type: "text/csv"
      )
    end

    def load_test_stats
      Sandbox::GenerateLoadTestStats.new(election.id).call
      send_file(
        Sandbox::GenerateLoadTestStats::STATS_OUTPUT_FILE_PATH,
        type: "application/json"
      )
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

    def results
      results = bulletin_board_client.get_election_results(election_id)
      @election_results = results[:election_results]
      @verifiable_results = results[:verifiable_results]
    end

    private

    delegate :authority, to: :election
    delegate :bulletin_board_server, :authority_slug, to: :bulletin_board_client

    attr_reader :election_results, :verifiable_results, :pending_message

    def election_data
      @election_data ||= params.require(:election).permit(:default_locale, title: {}).to_h.merge(
        trustees: trustees,
        start_date: start_date,
        end_date: end_date,
        polling_stations: polling_stations,
        questions: questions,
        answers: answers,
        ballot_styles: ballot_styles
      )
    end

    def start_date
      @start_date ||= params[:election][:start_date].to_i.days.from_now
    end

    def end_date
      @end_date ||= start_date + params[:election][:end_date].to_i.days
    end

    def trustees
      @trustees ||= Trustee.first(3).map do |trustee|
        {
          name: trustee.name,
          slug: trustee.slug,
          public_key: trustee.public_key
        }
      end
    end

    def polling_stations
      @polling_stations ||= params[:election][:polling_stations].reject(&:blank?)
    end

    def questions
      @questions ||= params.require(:election).permit(questions: {})[:questions].to_h.values.map do |question|
        question.merge(
          max_selections: question[:max_selections].to_i,
          answers: question[:answers].values.map do |answer|
            {
              slug: answer[:slug]
            }
          end
        )
      end
    end

    def answers
      @answers ||= params.require(:election).permit(questions: {})[:questions].to_h.values.flat_map do |question|
        question[:answers].values.map do |answer|
          {
            slug: answer[:slug],
            title: answer[:title]
          }
        end
      end
    end

    def ballot_styles
      @ballot_styles ||= params.require(:election).permit(ballot_styles: {})[:ballot_styles].to_h.transform_values(&:keys)
    end

    def go_back
      redirect_to sandbox_elections_path
    end

    def authority
      Authority.first
    end

    def authority_public_key
      @authority_public_key ||= authority.public_key.to_json
    end

    def elections
      @elections ||= Election.order(:id)
    end

    def election
      @election ||= elections.find(params[:id])
    end

    def election_id
      @election_id ||= election.unique_id.split(".").last
    end

    def bulletin_board_client
      @bulletin_board_client ||= Decidim::BulletinBoard::Client.new(bulletin_board_settings)
    end

    def bulletin_board_settings
      @bulletin_board_settings ||= OpenStruct.new(bulletin_board_settings_hash)
    end

    def bulletin_board_settings_hash
      @bulletin_board_settings_hash ||= {
        bulletin_board_server: api_endpoint_url,
        bulletin_board_public_key: BulletinBoard.public_key,
        authority_api_key: authority.api_key,
        authority_name: authority.name,
        authority_private_key: Test::PrivateKeys.authority_private_key_json,
        scheme_name: params.dig(:election, :voting_scheme_name) || "dummy",
        quorum: 2,
        number_of_trustees: 3
      }
    end

    def random_voter_id
      @random_voter_id ||= SecureRandom.hex
    end

    def number_of_votes_to_generate
      params[:number_of_votes]&.to_i || 1000
    end

    def default_bulk_votes_number
      DEFAULT_BULK_VOTES_NUMBER
    end

    def delete_bulk_votes_file(election)
      File.delete(bulk_votes_file_path(election)) if bulk_votes_file_exists?(election)
    end

    def bulk_votes_file_path(election)
      Rails.root.join("tmp", bulk_votes_file_name(election)).to_s
    end

    def bulk_votes_file_name(election)
      "bulk_votes_#{election.id}.csv"
    end

    def bulk_votes_file_exists?(election)
      File.exist?(bulk_votes_file_path(election))
    end

    def generated_votes_number(election)
      `wc -l "#{bulk_votes_file_path(election)}"`.strip.split(" ")[0].to_i
    end
  end
end
