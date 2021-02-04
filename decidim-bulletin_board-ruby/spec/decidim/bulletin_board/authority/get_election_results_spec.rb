# frozen_string_literal: true

require "spec_helper"

module Decidim
  module BulletinBoard
    module Authority
      describe GetElectionResults do
        subject { described_class.new(election_id) }

        include_context "with a configured bulletin board"

        let(:election_id) { "decidim-test-authority.1" }
        let(:bulletin_board_response) do
          {
            election: {
              logEntries: [{
                signedData: "eyJhbGciOiJSUzI1NiJ9.eyJtZXNzYWdlX2lkIjoiZGVjaWRpbS10ZXN0LWF1dGhvcml0eS45LmVuZF90YWxseStiLmJ1bGxldGluLWJvYXJkIiwiaWF0IjoxNjEyMjgyMTIxLCJyZXN1bHRzIjp7IjIzIjp7IjY3IjowLCI2NiI6MCwiNjkiOjQsIjY4IjowfSwiMjQiOnsiNzAiOjAsIjcxIjoxLCI3MiI6MX19fQ.eRMuWoCZ0l7YiSc5o2odiQZI1cxO0pRli_IjjtB1n9FNgEYpZyMfKADD8q7x4Y5ANv-fen-kLbi9r0Zzvx_uKIS0S8zizjKPJY5Npxz2DnBxUxULHFfsUO7q1cnDwDqkp6KTfTUlsDh7DmjLgxoSyyGA9euMpwvli6wgVEFlecIZWGxuP_dgxULyEvSPwlhg3PalZMuVKiASDvJmCFSQpBBgqNbMWidSVXtt6Msoob5SyIjLes5B8JSOsN_vCr6gI6rtK7h0rIyNcVhB9vQcLVsgfO8vTP4bcWciiVD_wnQvf5_JLbrHywudQooLBRnL8HLO7iHm4MkdpBzYcfG-5rvdq7RX50ISY3m9qfxdWRr3QbhkBAct4iPB3voy2ewvMLBPehRlZ_Pzl-ZVkmuk8Sb-AaGpm9DhE0gnx-ZBZ3bkVVz50Rq5nk5m7dlTvDFKCW85TGpWmZJIFA72H6k969BDloQXUGhtlV_wgE7bZP6BWiABzTf7euwnrQ4YWLbhGYaxlEKo5s9d_LQmPObfRvVVcyx6sd1ba4HmwuDIaXTSHAmTyLYvgeuWPHkf7q1Vg9KWO5Zst1EwW-K80ikBbIVU7fzkdfO8MYwRA22MxW-bg7jI8RT5_wlApF3IKMMxG0rz5gh3Zgsie8vCCXOy3s0LNW_Ymlc2d8n8gyPATv4"
              }]
            }
          }
        end

        context "when everything is ok" do
          it "broadcasts ok with the result of the graphql query" do
            expect { subject.call }.to broadcast(:ok)
          end

          it "uses the graphql client to perform an election query, decodes the the response and returns the encoded data" do
            subject.on(:ok) do |decoded_data|
              expect(decoded_data).to eq({ "23" => { "66" => 0, "67" => 0, "68" => 0, "69" => 4 }, "24" => { "70" => 0, "71" => 1, "72" => 1 } })
            end
            subject.call
          end
        end

        context "when the graphql operation returns an unexpected error" do
          let(:error_response) { true }

          it "broadcasts error with the unexpected error" do
            expect { subject.call }.to broadcast(:error, "Sorry, something went wrong")
          end
        end
      end
    end
  end
end
