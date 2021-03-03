# frozen_string_literal: true

module Sandbox
  class ElectionsController < ApplicationController
    helper_method :elections, :election
    helper_method :bulletin_board_server, :authority_slug, :authority_public_key
    helper_method :base_vote, :random_voter_id
    helper_method :election_results
    helper_method :default_bulk_votes_number

    BULK_VOTES_FILE = "storage/bulk_votes.csv"
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
      return file_client.cast_vote(election_id, params[:voter_id], params[:encrypted_ballot]) if params[:store_to_file].present?

      bulletin_board_client.cast_vote(election_id, params[:voter_id], params[:encrypted_ballot])
    end

    def generate_bulk_votes
      delete_bulk_votes_file

      number_of_votes_to_generate.times do
        file_client.cast_vote(election_id, SecureRandom.hex, random_encrypted_vote)
      end
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
      @election_results = bulletin_board_client.get_election_results(election_id)
    end

    private

    delegate :authority, to: :election
    delegate :bulletin_board_server, :authority_slug, to: :bulletin_board_client

    attr_reader :election_results

    def election_data
      @election_data ||= params.require(:election).permit(:default_locale, title: {}).to_h.merge(
        trustees: trustees,
        start_date: start_date,
        end_date: end_date,
        questions: questions,
        answers: answers
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
          slug: trustee.unique_id,
          public_key: trustee.public_key
        }
      end
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

    def file_client
      @file_client ||= Decidim::BulletinBoard::FileClient.new(BULK_VOTES_FILE, bulletin_board_settings)
    end

    def bulletin_board_settings
      @bulletin_board_settings ||= OpenStruct.new(
        bulletin_board_server: api_endpoint_url,
        bulletin_board_public_key: BulletinBoard.public_key,
        authority_api_key: authority.api_key,
        authority_name: authority.name,
        authority_private_key: Test::PrivateKeys.authority_private_key_json,
        scheme_name: params.dig(:election, :voting_scheme_name) || "dummy",
        quorum: 2,
        number_of_trustees: 3
      )
    end

    def base_vote
      @base_vote ||= election.manifest[:description][:contests].map do |contest|
        [
          contest[:object_id],
          contest[:ballot_selections].sample(Random.rand(contest[:number_elected]))
                                     .map { |ballot_selection| ballot_selection[:object_id] }
        ]
      end.to_h.to_json
    end

    def random_voter_id
      @random_voter_id ||= SecureRandom.hex
    end

    def delete_bulk_votes_file
      File.delete(BULK_VOTES_FILE) if File.exist?(BULK_VOTES_FILE)
    end

    def number_of_votes_to_generate
      params[:number_of_votes]&.to_i || 1000
    end

    def default_bulk_votes_number
      DEFAULT_BULK_VOTES_NUMBER
    end

    def random_encrypted_vote
      {
        ballot_style: "ballot-style",
        contests: election.manifest[:description][:contests].map do |contest|
          current_selections = 0
          {
            object_id: contest[:object_id],
            ballot_selections: contest[:ballot_selections].map do |ballot_selection|
              answer = random_answer(current_selections > contest[:number_elected])
              current_selections += answer
              {
                object_id: ballot_selection[:object_id],
                ciphertext: answer + (rand * 500).floor * joint_election_key
              }
            end
          }
        end
      }.to_json
    end

    def random_answer(max_reached)
      max_reached ? 0 : rand(0..1)
    end

    def joint_election_key
      @joint_election_key ||= JSON.parse(election.log_entries.where(message_type: "end_key_ceremony").last.decoded_data["content"])["joint_election_key"]
    end
  end
end
