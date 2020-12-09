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

  sequence(:voter_id) do |n|
    "voter-#{n}"
  end

  factory :json, class: "ActiveSupport::HashWithIndifferentAccess" do
    initialize_with { ActiveSupport::HashWithIndifferentAccess[**fix_reserved_names(attributes)] }
    skip_create

    # Warning! All transient parameters should have a block to prevent them from
    # being added to the hash
    factory :message do
      iat { Time.now.to_i }
    end

    factory :create_election_message, parent: :message do
      transient do
        authority { build(:authority) }
        start_date { 1.week.from_now }
        trustees_plus_keys { build_list(:trustee, 3).zip(generate_list(:private_key, 3)) }
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
        trustee { build(:trustee, private_key: private_key) }
        private_key { generate(:private_key) }
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

    factory :key_ceremony_message, parent: :message do
      transient do
        election { build(:election) }
        trustee { election.trustees.first }
      end

      message_id { "#{election.unique_id}.key_ceremony.trustee_election_keys+t.#{trustee.unique_id}" }
      owner_id { trustee.unique_id }
      sequence_order { election.manifest["trustees"].find_index { |trustee_json| trustee_json["name"] == trustee.name } }
      auxiliary_public_key { "-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA6HhvGDSiKTN+Osb7m+Gt\nAKFzr00lrkN5PWvZXcQxO27VGe/007fH3w7okKszJdv4Rsc5Cu+Xf4F4EQhN2H3q\n9YT4Rck7KpnHX7RaktV8yhJb7O7+O6wLt9/AzLbHkGYJlnIJMHpG6bbL300kGmhI\nSqHzNikSTqJytkrjjgL3nL7AQXq6DGOzpn7DfIBlnZq6vdWDgT0Eqwc7FxPFHyxM\nYUBl86EjhPpvonfAVWlk9Wp55dpeXbI2JsI1uaJliQcJF5bWJcx03QbEMcvs4HUT\nBbku/qSklfuHc96ebGBMgzM7Qyp5DY5HWSg2x+tF0v5j1+ZALKrJcQgnNj3IaTzc\nG3prvjaWbUwdJLBkRD7Fz112ZatS0K/kbf17OZW254wFXuHx3/DCl0r/XXI4PFeR\nWzfGFga6OKRd5dJxpwVbJ38+t53IQPA94OIn/4Ly8n1KtKawzXwFg6+p1ALUAw/Y\nJiwOBeoVrt/ChMvl+fLLH5TLNnhFkF2C9Is2dM+Q0wEc9sTkIYT9TOGfDrIvJOk9\nO0LIdj/ojB9aNkZB6A90m1QtpjYRpza+OG3uMNsjC4xd7w28vjs6EQPK+eKcPQ44\nA/xoJoAZ735k9qMYRz9RCK52TqdTwWFUfvg+Rrh9g9s0I7tNNcgxUSYFY51WWL1+\n9VxP6xd8EJVFheoyHc6P5isCAwEAAQ==\n-----END PUBLIC KEY-----\n" }
      election_public_key { 3 }
      election_public_key_proof

      trait :invalid do
        election_public_key { 4 }
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

    factory :open_ballot_box_message, parent: :message do
      transient do
        authority { build(:authority) }
        election { build(:election) }
        voting_scheme { :dummy }
      end

      message_id { "#{election.unique_id}.open_ballot_box+a.#{authority.unique_id}" }
      scheme { build(:voting_scheme, name: voting_scheme) }
      description { build(:description) }
    end

    factory :vote_message, parent: :message do
      transient do
        election { build(:election) }
        number_of_questions { 2 }
      end

      message_id { "#{election.unique_id}.vote.cast+v.#{_object_id}" }
      ballot_style { "ballot-style" }
      contests { build_list(:contest_ballot, number_of_questions) }
      _object_id { generate(:voter_id) }
      previous_tracking_hash { "" }
      timestamp { Time.current.to_i }
      crypto_hash { "bjISpYYhG+uthocLKA5wjOFdHPVo34xby8vz3RWj7BY=" }
      description_hash { "7dS66G9hBgVu+fIrx61sJDCECgU9UIawwy+RWi8xR9s=" }
      tracking_hash { "Cq6aF8l4dDCtuaptvyZ+Ej+Cep90CPPysVH4orucwoY=" }

      trait :invalid do
        ballot_style { "invalid-style" }
      end
    end

    factory :contest_ballot do
      transient do
        number_of_answers { 2 }
      end

      ballot_selections { build_list(:selection_ballot, number_of_answers, contest_id: _object_id) }
      crypto_hash { "INc1UrKLWxwaVjup1Vv+nW4GCdWsb1+hNGzlBeZpRUI=" }
      description_hash { "zRhfoa+0QfJYxeAyBST7TF7+ApGlwQUyGifvlT798/0=" }
      _object_id { generate(:contest_id) }
      proof { build(:contest_proof) }
    end

    factory :contest_proof do
      challenge { "1A1ZjlenxRKLSf6o0to2+fVkGoAIl4Z5DQSV4691GfI=" }
      constant { 1 }
      data { "/bB0vydnOyyn2KgsH0QmGvffhDv2X2cD92DQ1ZDnJbgjjfeDNRkv0DGGDYHuatLsXcdcEkH00PFvr92SrLOuqRK5ar4x1PMaAbReqzOn7khNnS64zOI+abiyefg704zPWDb73Mmp8VdAY0M+Z/zxGmMgvIqNannGK+bd55CND7l8KgIfkOLhqyKqtL72uH4fbZjivfpHG1Z2hV/JtaSou3HoET50+4A5JkwzgrMdMPNO/AOO7KixcOYNUZNu/AU4pW0S0R8/W3aSgLnEHPt2bC3WHlhPskjn4Q9G2cJBnhOBoJ1QM3hkDKx/FnBBpkcWLEuq98rFUXrYxrQiJNHBdbTKk30EAYc+K1JHiIkmhodmQ/tjCRR2YPgVgjnlrByHgZU6jkO2UZ16eGXrJx9EfG7+J02/69qE5BOoWCYae14WlR+2ZMjC80XqgNtcrjpgU2Oq+yOUpFshLkuHf5DXraDmF4VStK7uYjDRmBhrxNMWoWUy+RQeaQM68Vns/yU9h09YU6rhw3lcfM/nPjE40msnoozR9r4rCT1E4gOqKGFqz8HxM07DZ2iKJTj+sw3Lx3XAXWQ/0BIFyUTnIAr20ax1n6j4k6ZIc91ai3dvaNfHb7ngt/vscjcmhEVI4JUPlanGd4CRdCfIHiF/gBvqVHLucheM3pLAFh7mZKxElxc=" }
      name { "Constant Chaum Pedersen Proof" }
      pad { "yo4Xsd4W5ddd5KRT44/VMB1vFahfbhYVrA1gz6c9KWUohwR1ygMBwFHNgN+jfwqGKefSP1KzY9YTQTsARIRXdmfdxzMs7EIa5ylKmcBqP2BnC5l1WOJb+/NRXfltN1RNtx8gSICZ0rYIAcoqBVZJShTQRvZ2SUPDwhcw78wJJkFm3pMz9fH3/UCW+7c6iY1E6+cT/hi6m/3VaLGqVWMNTujrJo27FZp1cETNvCo9EKpJUYaWC5F3S4C1q9QFlwG5HOE2EsxrNyUiIxYhFi9YGt/mmXcASWjzck6lzQt92RO4U7I5t/B6jeq7Xx5hjbULbQtj/bdSAc4983TyCnLVjXE3EZwYoCLoNRg/biLBDIEOO6OPrfBmJoND5xdP50aoKmzjnj/Pg9Jns34cqc/S5DeVReiRMMuZ9R9eAiClu0IXKxORvWeD14RByoHUXI1KhGfV6DNyCmTXIVFbvJqVbFkqY60TVRqOwXRg9VozY7oG1f6KhGWqP4ZIXtYUlCO53hAIxh6DyMO1mVJ7/Ddqusc59O6916RJmdHUkKm0VZXEn3CBOTXkLRclb0LmdQ3559x1/HzY7Z6FsMsXQi7UMCaGW28TJFmj7x4XqXVUSyvxrrCeO8q3AuGkfgJjn+y02AjjIBFuEwSIDvxxqy+P5divFktS9p86qeVM8n5ax1Y=" }
      response { "KhC1tJ3j86JL6uXICZTgBtyNP5U2GLrrKChKwbiszi0=" }
      usage { "SelectionLimit" }
    end

    factory :selection_ballot do
      transient do
        contest_id { generate(:contest_id) }
      end

      ciphertext { build(:ciphertext) }
      crypto_hash { "eZgMl6CRoLl1CJoMdOp/VUoN5qi0pVOegxFJS7QqauM=" }
      description_hash { "c3MK/rIvA4poNcCvYKo+q4nww/SJ68nXaIoJjM3lQ9c=" }
      is_placeholder_selection { false }
      _object_id { "#{contest_id}-#{generate(:selection_id)}" }
      proof { build(:selection_proof) }
    end

    factory :ciphertext do
      pad { "samP9YzYLsSPBbhWr1jacr9FH9s4QrfLJcKSei48uFNf11STB+D18cEt5Hj523dkStJ61oGw9V6P6l82bpRk9KI5KhhAX9hS04lnSVx4zoY9CXzyROCExjnisc0sG10NL5GJZz0gNQXDO/KobRzG8OnucgZrX7Hk2otCF4ySeLEkgPSbA63V9f0460CCnbbZTk8CdhWOWzjN/Gk+0F1yLmdYZMs2SDVKCW0HISpzuBShEIJmQ1jRI9AwFoXuDKT+Mi5buanZuc5Zf5ApX8OY+Rh/x/MHQFNtDNa5ZGHEI1sWBBTPHXIBl8SCrRzSUVX6wCOMQyCtm/zLK3PMAizWE/eg8m87rp7tXNHy3kdAE5+joQ0egeITyPvmRpwXDc63rOBJ6p6AzMaz3Q+z0vntKwEXLuyLGzr0u+bR3lKf2j0LBAa2bWEUk2Junw+pHvQKvJiZ2NlppC3QJ3EFBdS/jblnIRlTDvu5CUTpwCwa6Q5hCp/S8RtWEef5eJ0dIi+Ws3NcAw799VrGVfn/ekhWNDBdZmOl9oJ9cX0e8NRyV9/pCgLFpQnZuSKN6NJFZfBXQetUAnYde8b6qIgrfGr3lfJSiEPZOTPxDvYvPkepCPCcYtlhJTH64zheO053az5G670Y9vveY5/tjHKGb47FYMPcN30/nuQvX/7WKF09zNM=" }
      data { "JSiqgi+D4L2FbbaG41+m3ARFN+V1Kk8eepJsiPacMxJYWGbOQ/n7uFzx1XoZOGM/9B34GapQQGC92LQljSct0cGVP+sBFpiUJAc1GckKVZlYHCveTb2NEfnBVjC6qxupua0E+b1oVjzBLg2WDkizyTs2KPDAboImQjCUAETohabUme5hVqk9AtafW5WLIXWWN4To8v0bpL3RwlHaFd5//I9axsPMEQ5WLdP0akQXeB4ADaes43L25RGadZylmTpoPbQcWnXbu4oKlBq1U6jTzghyOV3nAyFAe4mRYcJav0Afy0ZQXc2yirsK7iuNfiYd2fE4GFOYKOkLy+67U4qNdT30H/yQUThzDEWyVeQMKCqaRYd5ynwOHBQ7PdVg0MGEbCAdDqAP+TigFDZgk6URhieDpAnWcMbePkA4qy9LS5bomQUjWF/+tYmb+0v+Dw8adpHsn5TgByVVHsAYLecaoifl3louSF6/8PKdFswNB5iemOGEcpOgTJMIr1QDr746LdA+V7W2Rt1+fVOKI9HWbx1+CvOrJA7C012dej27TDzBnHpfpuZTM2FyPSNOAxe3Hg1hK3luxl3k5MbizRjkqKam/TbfOK1CBNnEHRDzO289sjM+6G523KE+5IHvDiex/fD91om+Ez2kia4UX+DO9uTQ/u8hEWJNtE1ges6csIE=" }
    end

    factory :selection_proof do
      challenge { "A81KTDONsn4ivK5iB1/u5kYS27SYBDAfYJUaU2xUYBo=" }
      name { "Disjunctive Chaum Pedersen Proof" }
      proof_one_challenge { "kEvG8XTr9rLVV1Xh9TaF0SvpUwR+yOe5zVAJXIYlAto=" }
      proof_one_data { "gLhJIkPAz4Yy62GX2XLnWLYu9tlSAJzOBoU5RF1Qan+VsrBfpsxMeQHfmEnF36/yW37u1hYicRXvfHSsBxoVw3l68PDYDZ0nPlo+APTPmVvPOiF764HS3bVdGSkEwkxfKZSqAJ2yNUl8racMXzVa8m3Ny7fc4t/yXdsp0H+JY7VasJ2fD2NqlijFLSluzfPKyo8cuf3r7JVxL9jJxjTcNkUcp+LaJcUIKETydPA4WNrSlEPbj0Uu77Ia9ygChgK80AM1vkwrH2vXYKSsazQyGbx0tnRAKxtkclug0yKTtYe41EmXDK8f4i3krI7fX9Atv6xYMhEGo1xapYtKBZB3R6h2WPyVVOfgvAq2Sak1y6L3dM17/wAZGAeojGQAVJLR0jRbK0B5GtQkezSy51pNr8+DBrQf8EVWOBulo84r5mooCXqePF7o9RusWZiEReXX1y0P0ATzZYnaXjnUA3WClIxuiV5VbOHhtXxMYKs3P77oAvCX5MGTj3NfAmuHTpkCtRy9wrCsfJ9nsytzsqYgWJ0KcVNsm9mqD7ne0l3/QvZlIH7mvDOkuh+5aMkeUdKxsICW4vvHU+bcaaK0i91balMUuodcCKbZ3nbaaMxYOgYrOHY2ejYzW9TjpbqUZQ7bqBaWu3xzL/K/XpaZVMDdMpOgcJi+yg/0CkjzGKIwkJs=" }
      proof_one_pad { "jYgXpGTOAnsrd444I0ZXX+hHLOHYKPv0wqv/1X5mCLZQ0uj5EfDNVO3XKHz8mipc06mNljdz/LsdCIAkRfZO2qFuftonZ510a/T52myy9QgZ11DwfjNujoL5Mz0CPRV1ez1gK+FVmdczWu7exZm7mlDzFCcdPFPyzc0/qkEU5kJEEny+PC9ewoGkj+wtm/aMxDx6KrrPAcF809Pp4vln0Hndh6pb3a6RJJJYf8Niapb94X6t59CL/0Wn4BzSPVHTZDRTK6GT0Rxzdd7mxVBVj+27hfYo7GSgY9dNA1DeCcwbJT63QJBb7boXzppKcOMBJpIWgpxpbX4RdU82tpdGVzTrFV8rWsXxrDpTQLuPo3A2Am8reGdoLu8vkkkzAY0vBcIOQExdXEs9W5sDxsLtovai9baqoNO9RSTLxiBSq80lg7FJEEWMJXnUhp8cHoNvKQNnczD/OqBtLBeec1+Amj8rk+VSu+YRIMgo368waU6c12xz7LtfoY0OSkhaVQKUnjWDwZvmLDJ5C8gFEuGpXRVKA7Yr49BClevPZcdTVuvq8qG7/LAKKwCdpLQVCYev3+OzypLQP3uWhhYchQfZQV59uv8AO9hbExCqj9qzc+oJSoPAZNmsmeLiUcrnCjGqF9yl1UJZlfSFf70K4guY8IdVHmUopPO2N7c7n5hOzGc=" }
      proof_one_response { "eCGz+a1v+0jRHnSpXvpp6GggMKmniKxwSB4m9csBPNg=" }
      proof_zero_challenge { "c4GDWr6hu8tNZViAEilpFRopiLAZO0hlk0UQ9uYvXIM=" }
      proof_zero_data { "RP4KwGkNLqwUDiCa3ev+Vwx9u4EODFAxUE6OW2ANcHmLC7XeEO2uxI+qaLYdw7d2j2vA4CYzTzLXwFemEVCQXif/JxPzUwEXfIrFk0jc+EcY3ah3sM+gdT+3DeF+rerttNzLmlQpH5PyLb73qLsAk90xf0q36mzfSrpW00MN3/8y30dLKG3tAKEJtmE98lDdy6Vv7e7dk1bZmrgfggV5mzMV17MgHtHSusNdazMG5M7vx5SXRwycOGO02q88NrBwDsjF9B9/tucfO9C7mPHMbeDwglTRMm76SPDGym4ETcQiR88C4CUk6G6TzKe9Nf5YCIiR+glIbEtvy9NhazCEdSH4ETtVTF55AWPn306PxCX6jcgmzlHx9faWcx+DcBTXdZYJVClOH7gsg3apVEWrmdkz+nAnEONyqWNP9Mjw2d4gsSgOi/Q6aTbUvejVaVI9A9H/iPR5L/hwvVIgCJoWfET2kfxHdGanqtQBrJu5fL5BYMOTSOYEsB6P7jaE+Pevz5qfrJsyypVJ237XTDxii3qPrbAm0gUSbnu38zNPFAGN7M0WixL7qAWz+pKshClQ1wGikR3EJ+6leaau4Kg29+Ck3t4BywceGWXNucfg7SdkvupzAfTfAhz9DkTo7/rB8RzkqpT8wULwg1fQiubjVKZBPM6YHe9ABj1+1jvnuPc=" }
      proof_zero_pad { "piFkW3bZFkBIFn45TTDK/GqjseMv+qoPeY4xyYqpKVtzSfqe/YaBjdyRxMGbJTWp3GoEN+vxbGK9tMwkKaiiwy8QRVJIL4wEeBEsdoI2RXf/hUkhFzRws3ITLbw+mkOuePWo0as0JVyfKNUdFPftNGlZwTrVKR3oP8BXqESUkHzrQlWujSKPZPII/5tLpid0fi/uj27pZqiwA8PCqPP9FnEXvFmF1dq7xG/OtbyTfRVOQctnbHJmqlZjKffo2PiYytP+7lncvoUdmA1SKaNEMz4Q51sKjuBR4lfOemZhj1pw75W4M6sQqA/abr6p4zwScrr1SjsCnVbQ0j35Or4ZNFZWxyRToU9Ri3pnYe0GR+KTbnHSRxUyfMd7DrypSZ/28w7n7cA/+HHpUUOrYigry5UDCHzKbPk9QrqrB2xUwtJJIx8FxAwKXafm7D0dLM172YXS92pCNotMMjzU2Of45f/aqrSgljVWNgFBpYGb62GuLXyyrxjQnvh9PDjgO0HxltFo19ZvrQJq55g8wEhaOfgwHNuoH/Di8TZ9GG8su+mKDio/qlKjG5NOBl12i/ks3zDSZW6PQ4cEGhjqZb/BxsB8u6lJf490irfuW7zbvKbzzUumhW+aIW9K+xdB2lZBdpCmc2zRywsng16IoQRED42dBeu5XSocu564Tw20Z5U=" }
      proof_zero_response { "Jtb2ECiDdfcnA1WShU1BiDjd/WC+seU18AyBgrurgIM=" }
      usage { "SelectionValue" }
    end
  end
end
