# frozen_string_literal: true

# A command with all the business logic to publish the election's results
class PublishResults < Rectify::Command
  include LogEntryCommand

  # Public: Initializes the command.
  #
  # authority - The authority sender of the publish results request
  # message_id - The message identifier
  # signed_data - The signed message received
  def initialize(authority, message_id, signed_data)
    @client = @authority = authority
    @message_id = message_id
    @signed_data = signed_data
  end

  # Executes the command. Broadcasts these events:
  #
  # - :ok when everything is valid.
  # - :invalid if the received data wasn't valid.
  #
  # Returns nothing.
  def call
    return broadcast(:invalid, error) unless
      valid_log_entry?("publish_results")

    election.with_lock do
      return broadcast(:invalid, error) unless
        valid_step?(election.tally_ended?) &&
        valid_client?(authority.authority? && election.authority == authority) &&
        valid_author?(message_identifier.from_authority?) &&
        process_message

      log_entry.election = election
      log_entry.save!

      create_verifiable_results

      election.results_published!
    end

    broadcast(:ok, election)
  end

  private

  attr_accessor :authority

  def verifiable_results_filename
    @verifiable_results_filename ||= "election-#{election.id}.tar"
  end

  def create_verifiable_results
    tar_filename, tar_filename_hash = create_tar do |tmpdir|
      jsonl = nil
      election.log_entries.find_each do |log_entry|
        jsonl = next_file(tmpdir, jsonl) if new_file_needed?(log_entry)
        write_log_entry(jsonl, log_entry)
      end
      close_file(jsonl)
    end

    election.verifiable_results_hash = tar_filename_hash
    election.verifiable_results.attach(io: File.open(tar_filename), filename: verifiable_results_filename)
    FileUtils.rm(tar_filename)
  end

  def create_tar
    Dir.mktmpdir do |tmpdir|
      yield tmpdir

      `TMPFILE=$(mktemp) && cd #{tmpdir} && tar -cf $TMPFILE * && sha256sum $TMPFILE`.split.reverse
    end
  end

  def new_file_needed?(log_entry)
    log_entry.message_type.starts_with?(/(create|start|end|publish)_/)
  end

  def next_file(tmpdir, jsonl)
    if jsonl
      close_file(jsonl)
    else
      jsonl = { status_index: 0 }
    end

    status_title = Election.statuses.to_a[jsonl[:status_index]].reverse.join("-")
    jsonl[:file] = Zlib::GzipWriter.open(File.join(tmpdir, "#{status_title}.jsonl.gz"))
    jsonl[:status_index] += 1
    jsonl
  end

  def close_file(jsonl)
    jsonl[:file].close
  end

  def write_log_entry(jsonl, log_entry)
    jsonl[:file].write(log_entry.slice(:message_id, :signed_data, :chained_hash, :content_hash).to_json)
    jsonl[:file].write("\n")
  end
end
