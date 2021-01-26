# frozen_string_literal: true

module Test
  module Elections
    class << self
      def trustees_election_keys
        [309, 353, 451]
      end

      def joint_election_key
        trustees_election_keys.reduce(:*)
      end

      def build_cast(election)
        election.manifest[:description][:contests].map do |contest|
          [
            contest[:object_id],
            contest[:ballot_selections].map do |ballot_selection|
              [
                ballot_selection[:object_id],
                yield
              ]
            end.to_h
          ]
        end.to_h
      end
    end
  end
end
