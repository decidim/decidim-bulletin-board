# frozen_string_literal: true

module Decidim
  module BulletinBoard
    class MessageIdentifier
      AUTHOR_TYPE = {
        a: :authority,
        b: :bulletin_board,
        t: :trustee,
        v: :voter
      }.freeze

      INVERTED_AUTHOR_TYPE = AUTHOR_TYPE.invert.freeze

      def initialize(message_id)
        @message_id = message_id
      end

      def from_authority?
        author_type == :authority
      end

      def from_trustee?
        author_type == :trustee
      end

      def from_voter?
        author_type == :voter
      end

      def author_type
        @author_type ||= AUTHOR_TYPE[author.first.to_sym]
      end

      def author_id
        @author_id ||= author.last
      end

      def authority_id
        @authority_id ||= elements[0]
      end

      def election_id
        @election_id ||= elements[0..1].join(".")
      end

      def type
        @type ||= elements[2]
      end

      def subtype
        @subtype ||= elements[3]
      end

      def type_subtype
        @type_subtype ||= [type, subtype].compact.join(".")
      end

      def to_s
        @message_id
      end

      def unique_trustee_id(authority_slug, trustee_name)
        "#{authority_slug}.#{trustee_name}"
      end

      class << self
        def format(unique_election_id, type_subtype, author_type, author_id)
          "#{unique_election_id}.#{type_subtype}+#{INVERTED_AUTHOR_TYPE[author_type]}.#{author_id}"
        end

        def unique_election_id(authority_slug, election_id)
          "#{authority_slug}.#{election_id}"
        end
      end

      private

      attr_accessor :message_id

      def elements
        @elements ||= parts.first.split(".", 4)
      end

      def author
        @author ||= parts.last.split(".", 2)
      end

      def parts
        @parts ||= message_id.split("+")
      end
    end
  end
end
