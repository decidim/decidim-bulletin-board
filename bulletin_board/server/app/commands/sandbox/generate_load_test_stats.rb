# frozen_string_literal: true

module Sandbox
  # A command with all the business logic to create the statistics of a load test
  class GenerateLoadTestStats < Rectify::Command
    STATS_OUTPUT_FILE_NAME = "load_test_stats.json"
    STATS_OUTPUT_FILE_PATH = Rails.root.join("tmp", STATS_OUTPUT_FILE_NAME)

    # Public: Initializes the command.
    #
    # election - The election to generate the stats for
    # earliest_vote_time - The time of the first vote to consider
    # latest_vote_time - The time of the last vote to consider
    def initialize(election_id, earliest_vote_time = 2.hours.ago, latest_vote_time = Time.zone.now)
      @election_id = election_id
      @earliest_vote_time = earliest_vote_time.is_a?(String) ? Time.zone.parse(earliest_vote_time) : earliest_vote_time
      @latest_vote_time = latest_vote_time.is_a?(String) ? Time.zone.parse(latest_vote_time) : latest_vote_time
    end

    # Executes the command.
    def call
      stats = generate_stats
      clear_existing_file
      write_stats_to_file(stats)
    end

    private

    attr_reader :election_id, :election, :earliest_vote_time, :latest_vote_time

    def generate_stats
      {
        votes: votes_stats,
        aggregates: aggregate_stats
      }
    end

    def votes_stats
      @votes_stats ||= pertinent_pending_messages.map do |pending_message|
        {
          message_id: pending_message.id,
          status: pending_message.status,
          created: pending_message.created_at,
          updated: pending_message.updated_at,
          processing_time: (pending_message.updated_at - pending_message.created_at) * 1000
        }
      end
    end

    def aggregate_stats
      {
        votes_number:,
        accepted_votes_number:,
        accepted_votes_percentage: accepted_votes_number * 100 / votes_number,
        total_processing_time:,
        avg_processing_time: total_processing_time / votes_number,
        total_running_time:
      }
    end

    def votes_number
      @votes_number ||= pertinent_pending_messages.size
    end

    def accepted_votes_number
      @accepted_votes_number ||= pertinent_pending_messages.where(status: "accepted").size
    end

    def total_running_time
      @total_running_time ||= (pertinent_pending_messages.max_by(&:updated_at)[:updated_at] - pertinent_pending_messages.min_by(&:created_at)[:created_at]) * 1000
    end

    def total_processing_time
      @total_processing_time ||= (votes_stats.sum { |vote| vote[:processing_time] })
    end

    def pertinent_pending_messages
      @pertinent_pending_messages ||= PendingMessage
                                      .where(election_id:)
                                      .where("created_at >= :date", date: earliest_vote_time)
                                      .where("created_at <= :date", date: latest_vote_time)
    end

    def clear_existing_file
      File.delete(STATS_OUTPUT_FILE_PATH) if File.exist?(STATS_OUTPUT_FILE_PATH)
    end

    def write_stats_to_file(stats)
      File.open(STATS_OUTPUT_FILE_PATH, "w") do |f|
        f.puts stats.to_json
      end
    end
  end
end
