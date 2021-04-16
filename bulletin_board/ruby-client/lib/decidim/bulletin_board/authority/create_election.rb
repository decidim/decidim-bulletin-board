# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Authority
      # This class handles the creation of an election.
      class CreateElection < Decidim::BulletinBoard::Command
        def initialize(election_id, election_data)
          @election_id = election_id
          @election_data = election_data
        end

        # Returns the message_id related to the operation
        def message_id
          @message_id ||= build_message_id(unique_election_id(election_id), "create_election")
        end

        def call
          # arguments used inside the graphql operation
          args = {
            message_id: message_id,
            signed_data: sign_message(message_id, message)
          }

          response = graphql.query do
            mutation do
              createElection(messageId: args[:message_id], signedData: args[:signed_data]) do
                election do
                  status
                end
                error
              end
            end
          end

          return broadcast(:error, response.data.create_election.error) if response.data.create_election.error.present?

          broadcast(:ok, response.data.create_election.election)
        rescue Graphlient::Errors::ServerError
          broadcast(:error, "Sorry, something went wrong")
        end

        private

        attr_reader :election_data, :election_id

        def message
          {
            scheme: scheme,
            bulletin_board: bulletin_board,
            authority: authority,
            trustees: trustees,
            polling_stations: polling_stations,
            description: {
              name: text(election_data[:title]),
              start_date: election_data[:start_date].strftime("%FT%T%:z"),
              end_date: election_data[:end_date].strftime("%FT%T%:z"),
              candidates: candidates,
              contests: contests,
              ballot_styles: ballot_styles
            }
          }
        end

        def scheme
          {
            name: settings.scheme_name,
            quorum: settings.quorum
          }
        end

        def bulletin_board
          {
            slug: "bulletin-board",
            name: "Bulletin Board",
            public_key: settings.bulletin_board_public_key
          }
        end

        def authority
          {
            slug: settings.authority_slug,
            name: settings.authority_name,
            public_key: settings.authority_public_key
          }
        end

        def trustees
          election_data[:trustees].map do |trustee|
            {
              slug: trustee[:name].parameterize,
              name: trustee[:name],
              public_key: trustee[:public_key]
            }
          end
        end

        def polling_stations
          election_data[:polling_stations] || []
        end

        def contests
          election_data[:questions].each_with_index.map do |question, index|
            {
              "@type": "CandidateContest",
              object_id: question[:slug],
              sequence_order: index,
              vote_variation: question[:max_selections] == 1 ? "one_of_m" : "n_of_m",
              name: default_text(question[:title]),
              number_elected: question[:max_selections],
              ballot_title: text(question[:title]),
              ballot_subtitle: text(question[:description]),
              ballot_selections: contest_answers(question)
            }
          end
        end

        def contest_answers(question)
          question[:answers].each_with_index.map do |answer, index|
            {
              object_id: "#{question[:slug]}_#{answer[:slug]}",
              sequence_order: index,
              candidate_id: answer[:slug]
            }
          end
        end

        def candidates
          election_data[:answers].map do |answer|
            {
              object_id: answer[:slug],
              ballot_name: text(answer[:title])
            }
          end
        end

        def ballot_styles
          election_data[:ballot_styles].map do |ballot_style_id, question_ids|
            {
              object_id: ballot_style_id.to_s,
              contests: question_ids
            }
          end
        end

        def default_text(field)
          field[default_locale]
        end

        def text(field)
          {
            text: field.map { |locale, value| { language: locale.to_s, value: value } }
          }
        end

        def default_locale
          @default_locale ||= election_data[:default_locale].to_sym
        end
      end
    end
  end
end
