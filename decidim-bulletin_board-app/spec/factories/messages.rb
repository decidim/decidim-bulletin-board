# frozen_string_literal: true

# rubocop:disable Style/HashTransformValues

require "test/elections"

def fix_reserved_names(attributes)
  attributes[:object_id] = attributes.delete(:_object_id) if attributes[:_object_id]
  attributes
end

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

  sequence(:voter_id) do |n|
    "voter-#{n}"
  end

  factory :hash, class: "ActiveSupport::HashWithIndifferentAccess" do
    initialize_with { ActiveSupport::HashWithIndifferentAccess[**fix_reserved_names(attributes)] }
    skip_create

    # Warning! All transient parameters should have a block to prevent them from
    # being added to the hash
    factory :message do
      transient do
        content_traits { [] }
      end

      iat { Time.now.to_i }
    end

    factory :create_election_message, parent: :message do
      transient do
        authority { Authority.first }
        start_date { 1.week.from_now }
        trustees_plus_keys { Trustee.first(3).zip(Test::PrivateKeys.trustees_private_keys) }
        voting_scheme { :dummy }
        election_id { "#{authority.unique_id}.#{generate(:election_id)}" }
        number_of_questions { 2 }
        title { Faker::Quotes::Shakespeare.as_you_like_it }
      end

      message_id { "#{election_id}.create_election+a.#{authority.unique_id}" }
      scheme { build(:voting_scheme, name: voting_scheme) }
      trustees { trustees_plus_keys.map { |trustee, private_key| build(:json_trustee, trustee: trustee, private_key: private_key) } }
      description { build(:description, number_of_questions: number_of_questions, start_date: start_date, title: title) }
    end

    factory :voting_scheme do
      name { "dummy" }
      parameters do
        {
          quorum: 2
        }.stringify_keys
      end
    end

    factory :json_trustee do
      transient do
        trustee { Trustee.first }
        private_key { Test::PrivateKeys.trustees_private_keys.first }
      end

      name { trustee.name }
      public_key { private_key.export.to_json }
    end

    factory :description do
      transient do
        number_of_questions { 2 }
        title { Faker::Quotes::Shakespeare.as_you_like_it }
      end

      name { build(:text, value: title) }
      start_date { 1.week.from_now }
      end_date { 2.weeks.from_now }
      candidates { [] }
      contests { build_list(:contest_description, number_of_questions) }

      after(:build) do |description|
        description[:contests].each_with_index do |contest, contest_order|
          contest[:sequence_order] = contest_order
          contest[:ballot_selections].each_with_index do |ballot_selection, selection_order|
            ballot_selection[:sequence_order] = selection_order
            description[:candidates] << build(:candidate_description, _object_id: ballot_selection[:candidate_id])
          end
        end
        [:start_date, :end_date].each { |field| description[field] = description[field].iso8601 }
      end
    end

    factory :candidate_description do
      _object_id { generate(:candidate_id) }
      ballot_name { build(:text) }
    end

    factory :contest_description do
      transient do
        number_of_answers { 2 }
      end

      type { "ReferendumContest" }
      _object_id { generate(:contest_id) }
      sequence_order { 0 }
      vote_variation { "one_of_m" }
      name { ballot_title[:text][0][:value] }
      number_elected { 1 }
      minimum_elected { 1 }
      ballot_title { build(:text) }
      ballot_subtitle { build(:text) }
      ballot_selections { build_list(:selection_description, number_of_answers, contest_id: _object_id) }
    end

    factory :text do
      transient do
        value { Faker::Quotes::Shakespeare.as_you_like_it }
      end

      text { build_list(:text_value, 1, value: value) }
    end

    factory :text_value do
      value { Faker::Quotes::Shakespeare.as_you_like_it }
      language { "en" }
    end

    factory :selection_description do
      transient do
        contest_id { generate(:contest_id) }
      end

      _object_id { "#{contest_id}-#{generate(:selection_id)}" }
      sequence_order { 0 }
      candidate_id { generate(:candidate_id) }
    end

    factory :start_key_ceremony_message, parent: :message do
      transient do
        election { create(:election) }
        authority { Authority.first }
      end

      message_id { "#{election.unique_id}.start_key_ceremony+a.#{authority.unique_id}" }
    end

    factory :key_ceremony_message, parent: :message do
      transient do
        election { create(:election, :key_ceremony) }
        trustee { Trustee.first }
        voting_scheme { :dummy }
      end

      message_id do
        case voting_scheme
        when :dummy
          "#{election.unique_id}.key_ceremony.step_1+t.#{trustee.unique_id}"
        else
          "#{election.unique_id}.key_ceremony.trustee_election_keys+t.#{trustee.unique_id}"
        end
      end
      content { build(:key_ceremony_message_content, *content_traits, election: election, trustee: trustee).to_json }
    end

    factory :key_ceremony_message_content do
      transient do
        election { create(:election) }
        trustee { Trustee.first }
      end

      owner_id { trustee.unique_id }
      sequence_order { election.manifest["trustees"].find_index { |trustee_json| trustee_json["name"] == trustee.name } }
      election_public_key { Test::Elections.trustees_election_keys.first }

      trait :invalid do
        owner_id { "wrong_trustee" }
      end

      trait :trustee_2 do
        election_public_key { Test::Elections.trustees_election_keys.second }
      end

      trait :trustee_3 do
        election_public_key { Test::Elections.trustees_election_keys.third }
      end
    end

    factory :end_key_ceremony_message, parent: :message do
      transient do
        election { create(:election) }
      end

      message_id { "#{election.unique_id}.end_key_ceremony+b.#{BulletinBoard.unique_id}" }
      content { build(:joint_election_message_content, *content_traits, election: election).to_json }
    end

    factory :joint_election_message_content do
      transient do
        election { create(:election) }
      end

      joint_election_key { Test::Elections.joint_election_key }
    end

    factory :start_vote_message, parent: :message do
      transient do
        election { create(:election, :key_ceremony_ended) }
        authority { Authority.first }
      end

      message_id { "#{election.unique_id}.start_vote+a.#{authority.unique_id}" }
    end

    factory :vote_message, parent: :message do
      transient do
        election { create(:election, :vote) }
        voter_id { generate(:voter_id) }
      end

      message_id { "#{election.unique_id}.vote.cast+v.#{voter_id}" }
      content { build(:vote_message_content, *content_traits, election: election).to_json }
    end

    factory :vote_message_content do
      transient do
        election { create(:election, :vote) }
        joint_election_key { Test::Elections.joint_election_key }
      end

      ballot_style { "ballot-style" }

      trait :invalid do
        ballot_style { "invalid-style" }
      end

      after(:build) do |content, evaluator|
        content[:contests] = evaluator.election.manifest[:description][:contests].map do |contest|
          selection = contest[:ballot_selections].sample(contest[:number_elected])
          {
            object_id: contest[:object_id],
            ballot_selections: contest[:ballot_selections].map do |ballot_selection|
              {
                object_id: ballot_selection[:object_id],
                ciphertext: (selection.member?(ballot_selection) ? 1 : 0) + Random.random_number(500) * evaluator.joint_election_key
              }
            end
          }
        end
      end
    end

    factory :end_vote_message, parent: :message do
      transient do
        election { create(:election, :vote) }
        authority { Authority.first }
      end

      message_id { "#{election.unique_id}.end_vote+a.#{authority.unique_id}" }
    end

    factory :start_tally_message, parent: :message do
      transient do
        election { create(:election, :vote_ended) }
        authority { Authority.first }
      end

      message_id { "#{election.unique_id}.start_tally+a.#{authority.unique_id}" }
    end

    factory :tally_cast_message, parent: :message do
      transient do
        election { create(:election, :tally) }
        joint_election_key { Test::Elections.joint_election_key }
      end

      message_id { "#{election.unique_id}.tally.cast+b.#{BulletinBoard.unique_id}" }
      content { Test::Elections.build_cast(election) { Random.random_number(99) + Random.random_number(13) * joint_election_key }.to_json }
    end

    factory :tally_share_message, parent: :message do
      transient do
        election { create(:election, :tally) }
        trustee { Trustee.first }
        joint_election_key { Test::Elections.joint_election_key }
        tally_cast { Test::Elections.build_cast(election) { Random.random_number(99) + Random.random_number(13) * joint_election_key } }
        election_public_key { Test::Elections.trustees_election_keys.first }
      end

      message_id { "#{election.unique_id}.tally.share+t.#{trustee.unique_id}" }
      content { build(:tally_share_message_content, *content_traits, election: election, trustee: trustee, tally_cast: tally_cast, election_public_key: election_public_key).to_json }
    end

    factory :tally_share_message_content do
      transient do
        election { create(:election, :tally) }
        trustee { Trustee.first }
        joint_election_key { Test::Elections.joint_election_key }
        tally_cast { Test::Elections.build_cast(election) { Random.random_number(99) + Random.random_number(13) * joint_election_key } }
        election_public_key { Test::Elections.trustees_election_keys.first }
      end

      owner_id { trustee.unique_id }

      trait :invalid do
        owner_id { "wrong_trustee" }
      end

      trait :trustee_2 do
        election_public_key { Test::Elections.trustees_election_keys.second }
      end

      trait :trustee_3 do
        election_public_key { Test::Elections.trustees_election_keys.third }
      end

      after(:build) do |content, evaluator|
        content[:contests] = evaluator.tally_cast.map do |question, answers|
          [
            question,
            answers.map do |answer, votes_sum|
              [
                answer,
                (votes_sum % evaluator.election_public_key) * evaluator.election_public_key
              ]
            end.to_h
          ]
        end.to_h
      end
    end

    factory :end_tally_message, parent: :message do
      transient do
        election { create(:election, :tally_ended) }
        authority { Authority.first }
        joint_election_key { Test::Elections.joint_election_key }
        tally_cast { Test::Elections.build_cast(election) { Random.random_number(99) + Random.random_number(13) * joint_election_key } }
      end

      message_id { "#{election.unique_id}.end_tally+b.#{BulletinBoard.unique_id}" }

      after(:build) do |message, evaluator|
        message[:results] = evaluator.tally_cast.map do |question, answers|
          [
            question,
            answers.map do |answer, votes_sum|
              [
                answer,
                votes_sum % evaluator.joint_election_key
              ]
            end.to_h
          ]
        end.to_h
      end
    end

    factory :publish_results_message, parent: :message do
      transient do
        election { create(:election, :results_published) }
        authority { Authority.first }
      end

      message_id { "#{election.unique_id}.publish_results+a.#{authority.unique_id}" }
    end
  end
end

# rubocop:enable Style/HashTransformValues
