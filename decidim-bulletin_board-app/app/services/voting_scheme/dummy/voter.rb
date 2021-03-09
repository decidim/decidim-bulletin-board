# frozen_string_literal: true

module VotingScheme
  module Dummy
    # A dummy implementation of a voter adapter, only for tests purposes.
    # It uses a very basic math to perform simple but unsecure encryption operations,
    # similar to a real voting scheme implementation. It works like this:
    # - every Trustee chooses a random number as their public election key: Ki = rand(50, 249) * 2 + 1
    #  - these keys should be odd numbers between 100 and 500
    # - the joint key is the product of those keys: JK = K1 * K2 * ... * Kn
    # - voters encrypt each answer multiplying the joint election key by a random number and summing 0 or 1 to that: Aj = JK * rand(100, 500) + (0 | 1)
    # - when the tally begins, the BB creates the tally cast summing all the encrypted votes per answer: At = A1 + A2 + ... + Am
    # - each trustee calculates the modulus between each answer cast and their election public key and multiply the result by their election public key:
    #   Si = (At % Ki) * Ki
    # - the final decryption of each answer consists on multiplying all the shares for that answer, dividing it by the joint election key and then
    #   calculating the inverse power with the number of trustees: R = ((S1 * S2 * ... * Sn) / JK) ** (1/n)

    class Voter < VotingScheme::Voter
    end
  end
end
