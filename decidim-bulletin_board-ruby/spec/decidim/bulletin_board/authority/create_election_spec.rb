# frozen_string_literal: true

require "spec_helper"

module Decidim
  module BulletinBoard
    module Authority
      describe CreateElection do
        subject(:command) { described_class.new(election_id, election_data) }

        include_context "with a configured bulletin board"

        let(:election_id) { 1 }
        let(:election_data) do
          {
            trustees: [
              {
                name: "trustee 1",
                slug: "trustee-1",
                public_key: "the public key 1"
              },
              {
                name: "trustee 2",
                slug: "trustee-2",
                public_key: "the public key 2"
              }
            ],
            default_locale: "en",
            title: {
              "en": "An election",
              "es": "Una elección"
            },
            start_date: Time.new(2023, 4, 5, 6, 7, 8, "+03:00"),
            end_date: Time.new(2023, 4, 7, 6, 5, 4, "+03:00"),
            questions: [
              {
                slug: "question-1",
                weight: 0,
                max_selections: 1,
                title: {
                  "en": "A question",
                  "es": "Una pregunta"
                },
                description: {
                  "en": "A question description",
                  "es": "Una descripción de pregunta"
                },
                answers: [
                  {
                    slug: "answer-1",
                    weight: 3
                  },
                  {
                    slug: "answer-2",
                    weight: 6
                  }
                ]
              },
              {
                slug: "question-2",
                weight: 23,
                max_selections: 2,
                title: {
                  "en": "Another question",
                  "es": "Otra pregunta"
                },
                description: {
                  "en": "Another question description",
                  "es": "Otra descripción de pregunta"
                },
                answers: [
                  {
                    slug: "answer-3",
                    weight: 123
                  },
                  {
                    slug: "answer-4",
                    weight: 0
                  }
                ]
              }
            ],
            answers: [
              {
                slug: "answer-1",
                title: {
                  "en": "An answer",
                  "es": "Una respuesta"
                }
              },
              {
                slug: "answer-2",
                title: {
                  "en": "Another answer",
                  "es": "Otra respuesta"
                }
              },
              {
                slug: "answer-3",
                title: {
                  "en": "An answer for another question",
                  "es": "Una respuesta para otra pregunta"
                }
              },
              {
                slug: "answer-4",
                title: {
                  "en": "Another answer for another question",
                  "es": "Otra respuesta para otra pregunta"
                }
              }
            ]
          }
        end

        let(:bulletin_board_response) do
          {
            createElection: {
              election: {
                status: "created"
              }
            }
          }
        end

        context "when everything is ok" do
          let(:create_election_message) do
            { scheme: { name: "test", quorum: 2 },
              bulletin_board: { name: "bulletin-board",
                                pretty_name: "Bulletin Board",
                                public_key: { kty: "RSA",
                                              n: "zMXsZpYPKkDlSmezX898y7zNOaJ7ENIN4kj4UhQ95Vm4HlgTpIs2VMMsO0eqynMaOR_G1mXdqbpbaJtXijBe4V8323QwGm6WVAa71E7pDXa5g6-uo5f8GePitN0YER9y2yNQN4uTaNzJiWV2uLBUYfMdj3SIif31YwLULHAOj3B_oleFK8coE_Qr3NzATcYBmsqE8AR4NljxTO6KDmP1SLdf5GBOBhOAIFbnL_Kpj2xkm7MS3hjMVKpiRhqA1UgX5oKZ8ixBv46fNJF0pBsHi3fHNjK9oZzgdx_AI-YFpdE_40-8bh_g9sWzxacqOM2-MdQLHbvRPEVltO3E8tr6I5YWrylcP7l9VD8OJeqjq2qFYHnGYdmLoD2XuXmI9EuBvSb9H4-qcartxZSIQCimKib_fxZvgrG1FSRRhK6YpvIdGv4-G2zfCCRsC4XD80TYI2bf-oYCoy7eU3_eVHFMV2yg4p1Wnuw2Vgq0edPL_bKaV9JvGx7F-U5juxNN0WZR9LzbPl4ReejzN95lyHgbj0nTH_u3bSpZmgJrQF-PwdnPcG46deVjJgUeosrlC4lQxVrRz0GL58BuFunnz2uYDBDrcJCiG60EbdkAFHjOcXU4wrUWATin7je_aqdBXhSnkTafcJAMvL7Y2Ld7vDge8nLqjAVlAi5am3rN0kqKT6M",
                                              e: "AQAB",
                                              kid: "a8e86f02ca27e1861bfc49e2a9a4614ca9068f8efdb6d42d19d3aab0eb2a31be" } },
              authority: { name: "decidim-test-authority",
                           pretty_name: "Decidim Test Authority",
                           public_key: { kty: "RSA",
                                         n: "pNgMt8lnPDD3TlWYGhRiV1oZkPQmnLdiUzwyb_-35qKD9k-HU86xo0uSgoOUWkBtnvFscq8zNDPAGAlZVokaN_z9ksZblSce0LEl8lJa3ICgghg7e8vg_7Lz5dyHSQ3PCLgenyFGcL401aglDde1Xo4ujdz33Lklc4U9zoyoLUI2_viYmNOU6n5Mn0sJd30FeICMrLD2gX46pGe3MGug6groT9EvpKcdOoJHKoO5yGSVaeY5-Bo3gngvlgjlS2mfwjCtF4NYwIQSd2al-p4BKnuYAVKRSgr8rYnnjhWfJ4GsCaqiyXNi5NPYRV6gl_cx_1jUcA1rRJqQR32I8c8QbAXm5qNO4URcdaKys9tNcVgXBL1FsSdbrLVVFWen1tfWNfHm-8BjiWCWD79-uk5gI0SjC9tWvTzVvswWXI5weNqqVXqpDydr46AsHE2sG40HRCR3UF3LupT-HwXTcYcOZr5dJClJIsU3Hrvy4wLssub69YSNR1Jxn-KX2vUc06xY8CNIuSMpfufEq5cZopL6O2l1pRsW1FQnF3s078_Y9MaQ1gPyBo0IipLBVUj5IjEIfPuiEk4jxkiUYDeqzf7bAvSFckp94yLkRWTs_pEZs7b_ogwRG6WMHjtcaNYe4CufhIm9ekkKDeAWOPRTHfKNmohRBh09XuvSjqrx5Z7rqb8",
                                         e: "AQAB",
                                         kid: "b8dba1459df956d60107690c34fa490db681eac4f73ffaf6e4055728c02ddc8e" } },
              trustees: [{ name: "trustee-1", pretty_name: "trustee 1", public_key: "the public key 1" },
                         { name: "trustee-2", pretty_name: "trustee 2", public_key: "the public key 2" }],
              description: { name: { text: [{ language: "en", value: "An election" },
                                            { language: "es", value: "Una elección" }] },
                             start_date: "2023-04-05T06:07:08+03:00",
                             end_date: "2023-04-07T06:05:04+03:00",
                             candidates: [{ object_id: "answer-1",
                                            ballot_name: { text: [{ language: "en", value: "An answer" },
                                                                  { language: "es", value: "Una respuesta" }] } },
                                          { object_id: "answer-2",
                                            ballot_name: { text: [{ language: "en", value: "Another answer" },
                                                                  { language: "es", value: "Otra respuesta" }] } },
                                          { object_id: "answer-3",
                                            ballot_name: { text: [{ language: "en", value: "An answer for another question" },
                                                                  { language: "es", value: "Una respuesta para otra pregunta" }] } },
                                          { object_id: "answer-4",
                                            ballot_name: { text: [{ language: "en", value: "Another answer for another question" },
                                                                  { language: "es", value: "Otra respuesta para otra pregunta" }] } }],
                             contests: [{ "@type": "CandidateContest",
                                          object_id: "question-1",
                                          sequence_order: 0,
                                          vote_variation: "one_of_m",
                                          name: "A question",
                                          number_elected: 2,
                                          ballot_title: { text: [{ language: "en", value: "A question" },
                                                                 { language: "es", value: "Una pregunta" }] },
                                          ballot_subtitle: { text: [{ language: "en", value: "A question description" },
                                                                    { language: "es", value: "Una descripción de pregunta" }] },
                                          ballot_selections: [{ object_id: "question-1_answer-1",
                                                                sequence_order: 3,
                                                                candidate_id: "answer-1" },
                                                              { object_id: "question-1_answer-2",
                                                                sequence_order: 6,
                                                                candidate_id: "answer-2" }] },
                                        { "@type": "CandidateContest",
                                          object_id: "question-2",
                                          sequence_order: 23,
                                          vote_variation: "n_of_m",
                                          name: "Another question",
                                          number_elected: 2,
                                          ballot_title: { text: [{ language: "en", value: "Another question" },
                                                                 { language: "es", value: "Otra pregunta" }] },
                                          ballot_subtitle: { text: [{ language: "en", value: "Another question description" },
                                                                    { language: "es", value: "Otra descripción de pregunta" }] },
                                          ballot_selections: [{ object_id: "question-2_answer-3",
                                                                sequence_order: 123,
                                                                candidate_id: "answer-3" },
                                                              { object_id: "question-2_answer-4",
                                                                sequence_order: 0,
                                                                candidate_id: "answer-4" }] }] } }
          end

          it "broadcasts ok with the result of the graphql mutation" do
            expect { subject.call }.to broadcast(:ok)
          end

          it "build the right message_id" do
            expect(subject.message_id).to eq("decidim-test-authority.1.create_election+a.decidim-test-authority")
          end

          it "builds the right message" do
            expect(subject.send(:message)).to eq(create_election_message)
          end

          it "uses the graphql client to open the ballot box and return the election" do
            subject.on(:ok) do |election|
              expect(election.status).to eq("created")
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
