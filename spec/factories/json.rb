# frozen_string_literal: true

FactoryBot.define do
  sequence(:candidate_id) do |n|
    "candidate-#{n}"
  end

  sequence(:contest_id) do |n|
    "contest-#{n}"
  end

  sequence(:selection_id) do |n|
    "selection-#{n}"
  end

  factory :json, class: "ActiveSupport::HashWithIndifferentAccess" do
    initialize_with { ActiveSupport::HashWithIndifferentAccess[**attributes] }
    skip_create

    factory :create_election_message do
      transient do
        authority
        start_date { 1.week.from_now }
      end

      iat { Time.now.to_i }
      election_id { [authority.name.parameterize, generate(:election_id)].join(".") }
      type { "create_election" }
      scheme
      trustees { build_list(:json_trustee, 3) }
      description { build(:description, start_date: start_date) }
    end

    factory :scheme do
      name { "test" }
      params do
        {
          quorum: 2
        }.stringify_keys
      end
    end

    factory :json_trustee do
      transient do
        private_key { generate(:private_key) }
      end

      name { Faker::Internet.username }
      public_key { private_key.export.to_json }
    end

    factory :description do
      name { build(:text) }
      start_date { 1.week.from_now }
      end_date { 2.weeks.from_now }
      candidates { [] }
      contests { build_list(:contest, 2) }

      after(:build) do |description|
        description[:contests].each_with_index do |contest, contest_order|
          contest[:sequence_order] = contest_order
          contest[:ballot_selections].each_with_index do |ballot_selection, selection_order|
            ballot_selection[:sequence_order] = selection_order
            description[:candidates] << build(:candidate, candidate_id: ballot_selection[:candidate_id])
          end
        end
      end
    end

    factory :candidate do
      object_id { generate(:candidate_id) }
      ballot_title { create_list(:text, 1) }
    end

    factory :contest do
      type { "ReferendumContest" }
      object_id { generate(:contest_id) }
      sequence_order { 0 }
      vote_variation { "one_of_m" }
      name { ballot_title[:text][0][:value] }
      number_elected { 1 }
      minimum_elected { 1 }
      ballot_title { build(:text) }
      ballot_subtitle { build(:text) }
      ballot_selections { build_list(:ballot_selection, 2, contest_id: object_id) }
    end

    factory :text do
      text { build_list(:text_value, 1) }
    end

    factory :text_value do
      value { Faker::Quotes::Shakespeare.as_you_like_it }
      language { "en" }
    end

    factory :ballot_selection do
      transient do
        contest_id { generate(:contest_id) }
      end

      object_id { "#{contest_id}-#{generate(:selection_id)}" }
      sequence_order { 0 }
      candidate_id { generate(:candidate_id) }
    end
  end
end
