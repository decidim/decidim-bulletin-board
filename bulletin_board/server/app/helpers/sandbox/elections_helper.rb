# frozen_string_literal: true

module Sandbox
  module ElectionsHelper
    def election_questions_with_answers(election)
      election.manifest.dig(:description, :contests).each_with_object({}) do |contest, acc|
        acc[contest[:object_id]] = contest[:ballot_selections].map { |ballot_selection| ballot_selection[:object_id] }
      end
    end

    def question_max_selections(question_id)
      election.manifest.dig(:description, :contests).find {|contest| contest["object_id"] == question_id }["number_elected"]
    end

    def has_ballot_styles?(election)
      election.manifest.dig(:description, :ballot_styles)&.any?
    end

    def options_for_ballot_style_select(election)
      options_for_select(election.manifest.dig(:description, :ballot_styles).map { |ballot_style| ballot_style["object_id"] })
    end

    def ballot_style_classes(question_id)
      (election.manifest.dig(:description, :ballot_styles) || []).map do |ballot_style|
        if ballot_style["contests"].include?(question_id)
          ballot_style["object_id"]
        else
          ""
        end
      end.join(" ")
    end
  end
end
