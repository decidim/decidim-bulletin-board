# frozen_string_literal: true

module Sandbox
  module ElectionsHelper
    def options_for_ballot_style_select(election)
      options_for_select(election.manifest[:description][:ballot_styles].map { |ballot_style| ballot_style["object_id"] })
    end

    def election_questions_with_answers(election)
      election.manifest[:description][:contests].each_with_object({}) do |contest, acc|
        acc[contest[:object_id]] = contest[:ballot_selections].map { |ballot_selection| ballot_selection[:object_id] }
      end
    end

    def ballot_style_classes(question_id)
      election.manifest[:description][:ballot_styles].map do |ballot_style|
        if ballot_style["contests"].include?(question_id)
          ballot_style["object_id"]
        else
          ""
        end
      end.join(" ")
    end

    def has_ballot_styles?(election)
      election.manifest[:description][:ballot_styles].length.positive?
    end
  end
end
