# frozen_string_literal: true

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

  factory :json, class: "ActiveSupport::HashWithIndifferentAccess" do
    initialize_with { ActiveSupport::HashWithIndifferentAccess[**fix_reserved_names(attributes)] }
    skip_create

    # Warning! All transient parameters should have a block to prevent them from
    # being added to the hash

    factory :create_election_message do
      transient do
        authority { build(:authority) }
        start_date { 1.week.from_now }
        trustees_plus_keys { build_list(:trustee, 3).zip(generate_list(:private_key, 3)) }
        voting_scheme { :dummy }
        election_id { "#{authority.name.parameterize}.#{generate(:election_id)}" }
      end

      iat { Time.now.to_i }
      message_id { "#{election_id}.create_election+a.#{authority.name.parameterize}" }
      scheme { build(:voting_scheme, name: voting_scheme) }
      trustees { trustees_plus_keys.map { |trustee, private_key| build(:json_trustee, trustee: trustee, private_key: private_key) } }
      description { build(:description, start_date: start_date) }
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
        trustee { build(:trustee, private_key: private_key) }
        private_key { generate(:private_key) }
      end

      name { trustee.name }
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
            description[:candidates] << build(:candidate, _object_id: ballot_selection[:candidate_id])
          end
        end
        [:start_date, :end_date].each { |field| description[field] = description[field].iso8601 }
      end
    end

    factory :candidate do
      _object_id { generate(:candidate_id) }
      ballot_name { build(:text) }
    end

    factory :contest do
      type { "ReferendumContest" }
      _object_id { generate(:contest_id) }
      sequence_order { 0 }
      vote_variation { "one_of_m" }
      name { ballot_title[:text][0][:value] }
      number_elected { 1 }
      minimum_elected { 1 }
      ballot_title { build(:text) }
      ballot_subtitle { build(:text) }
      ballot_selections { build_list(:ballot_selection, 2, contest_id: _object_id) }
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

      _object_id { "#{contest_id}-#{generate(:selection_id)}" }
      sequence_order { 0 }
      candidate_id { generate(:candidate_id) }
    end

    factory :key_ceremony_message do
      transient do
        election { build(:election) }
        trustee { election.trustees.first }
      end

      iat { Time.now.to_i }
      message_id { "#{election.unique_id}.key_ceremony.trustee_election_keys+t.#{trustee.unique_id}" }

      owner_id { trustee.unique_id }
      sequence_order { election.manifest["trustees"].find_index { |trustee_json| trustee_json["name"] == trustee.name } }
      auxiliary_public_key { "-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA6HhvGDSiKTN+Osb7m+Gt\nAKFzr00lrkN5PWvZXcQxO27VGe/007fH3w7okKszJdv4Rsc5Cu+Xf4F4EQhN2H3q\n9YT4Rck7KpnHX7RaktV8yhJb7O7+O6wLt9/AzLbHkGYJlnIJMHpG6bbL300kGmhI\nSqHzNikSTqJytkrjjgL3nL7AQXq6DGOzpn7DfIBlnZq6vdWDgT0Eqwc7FxPFHyxM\nYUBl86EjhPpvonfAVWlk9Wp55dpeXbI2JsI1uaJliQcJF5bWJcx03QbEMcvs4HUT\nBbku/qSklfuHc96ebGBMgzM7Qyp5DY5HWSg2x+tF0v5j1+ZALKrJcQgnNj3IaTzc\nG3prvjaWbUwdJLBkRD7Fz112ZatS0K/kbf17OZW254wFXuHx3/DCl0r/XXI4PFeR\nWzfGFga6OKRd5dJxpwVbJ38+t53IQPA94OIn/4Ly8n1KtKawzXwFg6+p1ALUAw/Y\nJiwOBeoVrt/ChMvl+fLLH5TLNnhFkF2C9Is2dM+Q0wEc9sTkIYT9TOGfDrIvJOk9\nO0LIdj/ojB9aNkZB6A90m1QtpjYRpza+OG3uMNsjC4xd7w28vjs6EQPK+eKcPQ44\nA/xoJoAZ735k9qMYRz9RCK52TqdTwWFUfvg+Rrh9g9s0I7tNNcgxUSYFY51WWL1+\n9VxP6xd8EJVFheoyHc6P5isCAwEAAQ==\n-----END PUBLIC KEY-----\n" }
      election_public_key { 3 }
      election_public_key_proof

      trait :election_guard do
        election_public_key { "UxmYOgII7XfkqtmIhkm2I3W5g83recLynlu+z6qK9/iSyB1hW+H7j7KpKnd+pLAOCnxrKA7Kglxk4x5jQdXfYRhiTkL9TzIhejVoXpFFEqH8I1+8mPCYMPY1GxBhZodbAl3CRSIRqS7IMQfFZ6gtZFjrij5P70SuXYyI+K2igVcQuG1BK8CKFXpzDxiKhbVltIjNk4un8K48lTkNqH+nyJ+GQiBUi+x2/gGxgF6naQO9Z/ZAgTcECf9J7LnPxY/0iFkAyJsQiyDpktPCVfy5aAfUYwbDxatIIoE7ujKXyxrbEHPu+VtX3GvLRb53kPp8Wuh3b8eDSagwmh4Fa/yHpcfq1CJSGT4C4K55VbtQ1PcMTQyGJEtgBjpU/3XGyLK1TarnmFlZonKRiuYhHMLKmj4E1F5jaJ12/AwS+jXjTASZwMHgVdflkMCH/rceutcLTKtISNtZdGmP9JcnQ1uOCr1EQe/2sTlz1M8YzvupoPtBUE9ZtgvxGzPKx+tldJQv1cqVsAYTmEL3McUFeK3YLa5819kAOdZ/1tGy3pk3mIRdbiD1GFyiW3MEOwEAKVikIxninC0TwIw0ZiKh5C6YP3mOTN2C8zmWle1uPihO7XLK0f4TKC0pyCMXklkyZa05ZmjWgctJ17RWjLE1boNVTFwFOmy3ASErzDGbJtu9g8A=" }
      end
    end

    factory :election_public_key_proof do
      challenge { "7ER1o3ZlShoCD8Okg5Q6uaUAJUpL1l7SdD4pg6CkAw8=" }
      commitment { "pl8zhjfiBLMCm/IgqapjuvmiU0d1EmfOANkf+ld3+R+EqWLZQ0K4l3Ae3Dv3ipP2dgKqNv/wGe61ZoRvhFGkQJnxXo/nFH3OR9bwqZLHpv6ZYeSX3ajD/f+M7nFUCbxDyZvlZYcPLcr2LSgFPXyKDr9tqpazpkQBo44ztZDIe1llv+aaxoiJP/A36IO0bVGKDG2BEU99+qUPMk8rxzaahI3u7yhI8MOC2FJUWTWwTZgnWsV2DnduGaW2cipCG1mbs3OfqHTodl10rOeLngw9CyybfvZdp0YIv1WLGO6S5jadJBYhptUCpamLW0C5pVpCG8uvTaR28kKS9h0NqEu6qa8g5Ow5bKrfxV2vb9SH4Ut1+2+9HqPyjGN16jKMIT79ZCu1iEEN2+RUw9K0rdRaqhKcOY9imLeHk8L5D0GJpR5MYgluFCmDl/+YDZbzE/m165OPiirqlSpY9gn9jCflDuXx9gR/kqsw28z1ImYo7eBDRPG2tQGgExibhycK4SLxPBL3nvYwtlrvd0EtP7eyA6Wb1RotJ92snSH5J5SleNBNCFEWm6cnlGGJ5el/2/kG/jcDVXLz4V02s6+FTbWXTF6s9mOg9Jp65av/T2umlfWvgT/r72AGyOn4hQtI9aGdyv7xPxyU7iiZa2h7BUpEQ3R5F2CO8NmBpdS0m5VEfrA=" }
      name { "Schnorr Proof" }
      public_key { "UxmYOgII7XfkqtmIhkm2I3W5g83recLynlu+z6qK9/iSyB1hW+H7j7KpKnd+pLAOCnxrKA7Kglxk4x5jQdXfYRhiTkL9TzIhejVoXpFFEqH8I1+8mPCYMPY1GxBhZodbAl3CRSIRqS7IMQfFZ6gtZFjrij5P70SuXYyI+K2igVcQuG1BK8CKFXpzDxiKhbVltIjNk4un8K48lTkNqH+nyJ+GQiBUi+x2/gGxgF6naQO9Z/ZAgTcECf9J7LnPxY/0iFkAyJsQiyDpktPCVfy5aAfUYwbDxatIIoE7ujKXyxrbEHPu+VtX3GvLRb53kPp8Wuh3b8eDSagwmh4Fa/yHpcfq1CJSGT4C4K55VbtQ1PcMTQyGJEtgBjpU/3XGyLK1TarnmFlZonKRiuYhHMLKmj4E1F5jaJ12/AwS+jXjTASZwMHgVdflkMCH/rceutcLTKtISNtZdGmP9JcnQ1uOCr1EQe/2sTlz1M8YzvupoPtBUE9ZtgvxGzPKx+tldJQv1cqVsAYTmEL3McUFeK3YLa5819kAOdZ/1tGy3pk3mIRdbiD1GFyiW3MEOwEAKVikIxninC0TwIw0ZiKh5C6YP3mOTN2C8zmWle1uPihO7XLK0f4TKC0pyCMXklkyZa05ZmjWgctJ17RWjLE1boNVTFwFOmy3ASErzDGbJtu9g8A=" }
      response { "puH3SmTJnSn4JL3uDM5exiB0mDa67vibiu3qkA8IbCM" }
      usage { "SecretValue" }
    end
  end
end
