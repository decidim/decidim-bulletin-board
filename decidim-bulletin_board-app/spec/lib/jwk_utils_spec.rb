# frozen_string_literal: true

require "rails_helper"
require "jwk_utils"

RSpec.describe JwkUtils do
  PUBLIC_KEY = {
    "kty": "RSA",
    "n": "0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw",
    "e": "AQAB",
    "alg": "RS256",
    "kid": "2011-04-29"
  }.freeze

  PRIVATE_KEY = {
    "p": "7w3nfUDi7KZs5NkllDNy3Te77ngZFpiLvLykf0hO8BQ5G58ce9LSsCoLvsnV5iNzSQHFaE-JGn96zfWTX0zsWq0MRYEaL6DCqWLjVm7jNcMSdIzkFNWSDS42liyptdNIT6TyOKdG3ifKOetG8Sad1XEFp0pvwjsiEz7M2uA123c",
    "kty": "RSA",
    "q": "sFWTqTCf1eTeWUsCk-NP_f0flK-_mAOu7A-c7SoHPVUlzaiFZH9RVqLfOB3tHzcgetZvqk90UCnTdruFcb-8GWR1dh3M-Klm2leqFfPjQsQQoCM1a3nIQ1r_4jMBqeOD1Rs2L9cvm974CS4-QnuyAlNAjR7Bmlh2y4caZITkqic",
    "d": "Eg9UYFs2a2Yq9pu0k9SKJm_UlRy-Dsj5HnIcwvHro5uzk2qH0xBg76HpgNhm5VQQB9oiXTlwPVDefct-efGvEL4bxN-xBslxwSbs_tM6iVev5AdFj83JEmfLZ2evuDhJQIDalwh--WQc1l-BGwVsRWJppd-NLajoAzk5GnMlEPDyW2JqXmSZBWokRJXhaikOAos8Ru7BVguslp_1-Di0dKYYxadhpK4OnfN8jrn-rWfnB_vM4Zsdn7F5xSDpVZqGRe4WVpESAm7AGj10hvVuwHfYzzFH1c9CWD8rKo_9EC-HbC3oK43lzfF9aiFJSKNR688nGNjKnjPNrWVV3FwmUQ",
    "e": "AQAB",
    "kid": "4a6f3b9b74baa695587ce7253812bab97e2f6f51ce4402b0f7c3503ca76cdc63",
    "qi": "iN8r6JFGv69ZtmgiXJq4qTkeEM5lvXnZSeX6dHjYbJQNLApg3j37nq7r2JDBFCssnBZlmo9FuXy1JmwHHEgaxj_WAtMG_elwXDJeHoLwcsQsp7JhIBacgpfFvfY9Uo88Rx3RG4IYtRX8GfV8QDX5cgsmBsKq2wVrIEWkH_H5F8U",
    "dp": "fq6VoDDEkLhZOKVCXtks48JnWyZV1T2dv7UQT0tYWa293b9h7tR4RlbhxodbTQw4SdYgcPjFJT-tKnwbTwOKtTrDKAoUgGzm-7Cl3OYCjjkEDLOlIs1TCp0U3FxqyypeRaaZniA3U_8uEad2_tCCD9xHLLIrq3h-xEghc1Qh9l0",
    "dq": "KUxRof1-YcURgk48E1DYqj6_R76Fm9-49xaNBUqjmWy4xtriKvBap3TL3MO9hmMN21cfnf6v2hqBqTwv-70RG81YaUp_d_mM2jRP5IZTQo7S6f51A2_pREUqytpxWE2t0Zpm7XtzbgkhhFztPfrkbQD8jFCYvUJcyDwjJUmumF8",
    "n": "pKl4pvK1KMOuZfQll8JisCaSVvKUSJ6yVrsFc3zi_h_hxGJpnpCYt5bnvNOvkmlTenMvs338iV7fC1M0wuP4rbM7gwst9dS2J-m110O3giUVW9tNUpp1G898Vrm8eIVlCDH4lowb_ULAH8faMhfoc6FfUNE9TQChIGHhpPokVI59frfmgf_RkvT43EqPhB2b8Knk9c8BH3hwLkmQo0uo1HLn_SGjNTXzkZZKUrKLrAN4DU2bSjnvP7YH9Ep683AI9HU0vBYMEKKyEDnl6y3Qorlr1sfWUr1UXWOb6GaNcyZy81kkTs_9XlitN_XdzKTXBfyDnlOIaxUXOtPYve11IQ"
  }.freeze

  subject { described_class }

  context "when working with a private key" do
    let(:json) { PUBLIC_KEY }
    let(:jwk) { JWT::JWK.import(json) }

    it { expect(subject).not_to be_private_key(json) }

    it "returns the right thumbprint" do
      expect(subject.thumbprint(json)).to eq("NzbLsXh8uDCcd-6MNwXF4W_7noWXFZAfHkxZsRGC9Xs")
    end

    it "can't do a private export" do
      expect { subject.private_export(jwk) }.to raise_error("Not a private key")
    end
  end

  context "when working with a private key" do
    let(:json) { PRIVATE_KEY }
    let(:jwk) { subject.import_private_key(json) }

    it { expect(subject).to be_private_key(json) }

    it "returns the right thumbprint" do
      expect(subject.thumbprint(json)).to eq("ANLv6SU213shhuiVmp2S7OIsQgOaV77b8Xjkk_GKKfI")
    end

    it "can do a private export" do
      expect(subject.private_export(jwk)).to eq(json)
    end
  end
end
