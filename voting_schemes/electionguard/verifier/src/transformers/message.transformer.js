import fs from "fs";
import { join } from "path";

import { parseBase64 } from "./utils.js";

const MANIFEST_FILE_NAME = "manifest.json";
const CONTEXT_FILE_NAME = "context.json";
const CONSTANTS_FILE_NAME = "constants.json";
const COEFFICIENTS_FOLDER_NAME = "coefficients";
const COEFFICIENT_VALIDATION_FILE_NAME_PREFIX = "coefficient_validation_set";
const DEVICES_FOLDER_NAME = "devices";
const ENCRYPTED_BALLOTS_FOLDER_NAME = "encrypted_ballots";
const ENCRYPTED_BALLOT_FILE_NAME_PREFIX = "ballot";
const ENCRYPTED_TALLY_FILE_NAME = "encrypted_tally.json";
const TALLY_FILE_NAME = "tally.json";

export const transform = (path, messageType, messageSubType, decodedData) => {
  switch (messageType) {
    case "create_election": {
      const { description, scheme, trustees } = decodedData;
      const { name, candidates, contests, start_date, end_date } = description;
      const { quorum } = scheme;

      fs.writeFileSync(
        join(path, MANIFEST_FILE_NAME),
        JSON.stringify(
          {
            name,
            candidates: candidates.map(({ ballot_name, object_id }) => ({
              name: ballot_name,
              object_id,
            })),
            contests: contests.map((contest) => ({
              ...contest,
              electoral_district_id: "a-place", // TODO: hardcoded place
              votes_allowed: contest.number_elected, // TODO: review later
            })),
            start_date,
            end_date,
            type: "special",
            election_scope_id: "test-election",
            geopolitical_units: [
              // TODO: hardcoded place
              {
                name: "A place",
                object_id: "a-place",
                type: "county",
              },
            ],
          },
          null,
          2,
        ),
      );

      fs.writeFileSync(
        join(path, CONTEXT_FILE_NAME),
        JSON.stringify(
          {
            number_of_guardians: trustees.length,
            quorum,
          },
          null,
          2,
        ),
      );

      fs.mkdirSync(join(path, COEFFICIENTS_FOLDER_NAME));
      fs.mkdirSync(join(path, DEVICES_FOLDER_NAME));
      fs.mkdirSync(join(path, ENCRYPTED_BALLOTS_FOLDER_NAME));

      trustees.forEach(({ slug }) => {
        fs.writeFileSync(
          join(
            path,
            COEFFICIENTS_FOLDER_NAME,
            `${COEFFICIENT_VALIDATION_FILE_NAME_PREFIX}_${slug}.json`,
          ),
          JSON.stringify(
            {
              owner_id: slug,
            },
            null,
            2,
          ),
        );
      });

      break;
    }
    case "key_ceremony": {
      if (messageSubType === "trustee_partial_election_keys") {
        const { content } = decodedData;
        const {
          guardian_id,
          partial_keys: [{ coefficient_commitments, coefficient_proofs }],
        } = JSON.parse(content);

        const coefficientValidationSet = JSON.parse(
          fs.readFileSync(
            join(
              path,
              COEFFICIENTS_FOLDER_NAME,
              `${COEFFICIENT_VALIDATION_FILE_NAME_PREFIX}_${guardian_id}.json`,
            ),
          ),
        );

        fs.writeFileSync(
          join(
            path,
            COEFFICIENTS_FOLDER_NAME,
            `${COEFFICIENT_VALIDATION_FILE_NAME_PREFIX}_${guardian_id}.json`,
          ),
          JSON.stringify(
            {
              ...coefficientValidationSet,
              coefficient_commitments: coefficient_commitments.map(parseBase64),
              coefficient_proofs: coefficient_proofs.map(
                ({
                  challenge,
                  commitment,
                  name,
                  public_key,
                  response,
                  usage,
                }) => ({
                  challenge: parseBase64(challenge),
                  commitment: parseBase64(commitment),
                  name,
                  public_key: parseBase64(public_key),
                  response: parseBase64(response),
                  usage,
                }),
              ),
            },
            null,
            2,
          ),
        );
      }

      break;
    }
    case "end_key_ceremony": {
      const { content } = decodedData;
      const { election_joint_key, context, constants } = JSON.parse(content);

      const existingContext = JSON.parse(
        fs.readFileSync(join(path, CONTEXT_FILE_NAME)),
      );

      fs.writeFileSync(
        join(path, CONTEXT_FILE_NAME),
        JSON.stringify(
          {
            ...existingContext,
            elgamal_public_key: parseBase64(
              election_joint_key.joint_public_key,
            ),
            commitment_hash: parseBase64(context.commitment_hash),
            crypto_base_hash: parseBase64(context.crypto_base_hash),
            crypto_extended_base_hash: parseBase64(
              context.crypto_extended_base_hash,
            ),
            description_hash: parseBase64(context.description_hash),
          },
          null,
          2,
        ),
      );

      fs.writeFileSync(
        join(path, CONSTANTS_FILE_NAME),
        JSON.stringify(
          {
            cofactor: parseBase64(constants.cofactor),
            generator: parseBase64(constants.generator),
            large_prime: parseBase64(constants.large_prime),
            small_prime: parseBase64(constants.small_prime),
          },
          null,
          2,
        ),
      );
      break;
    }
    case "vote": {
      const { content } = decodedData;
      const {
        object_id,
        style_id,
        crypto_hash,
        manifest_hash,
        contests,
        previous_code,
        code,
      } = JSON.parse(content);

      fs.writeFileSync(
        join(
          path,
          ENCRYPTED_BALLOTS_FOLDER_NAME,
          `${ENCRYPTED_BALLOT_FILE_NAME_PREFIX}_${object_id}.json`,
        ),
        JSON.stringify(
          {
            object_id,
            style_id,
            crypto_hash: parseBase64(crypto_hash),
            manifest_hash: parseBase64(manifest_hash),
            contests: contests.map(
              ({
                ballot_selections,
                ciphertext_accumulation,
                crypto_hash,
                description_hash,
                object_id,
                proof,
              }) => ({
                ballot_selections: ballot_selections.map(
                  ({
                    ciphertext,
                    crypto_hash,
                    description_hash,
                    is_placeholder_selection,
                    object_id,
                    proof,
                  }) => ({
                    ciphertext: {
                      pad: parseBase64(ciphertext.pad),
                      data: parseBase64(ciphertext.data),
                    },
                    crypto_hash: parseBase64(crypto_hash),
                    description_hash: parseBase64(description_hash),
                    is_placeholder_selection,
                    object_id,
                    proof: {
                      challenge: parseBase64(proof.challenge),
                      name: proof.name,
                      proof_one_challenge: parseBase64(
                        proof.proof_one_challenge,
                      ),
                      proof_one_data: parseBase64(proof.proof_one_data),
                      proof_one_pad: parseBase64(proof.proof_one_pad),
                      proof_one_response: parseBase64(proof.proof_one_response),
                      proof_zero_challenge: parseBase64(
                        proof.proof_zero_challenge,
                      ),
                      proof_zero_data: parseBase64(proof.proof_zero_data),
                      proof_zero_pad: parseBase64(proof.proof_zero_pad),
                      proof_zero_response: parseBase64(
                        proof.proof_zero_response,
                      ),
                      usage: proof.usage,
                    },
                  }),
                ),
                ciphertext_accumulation: {
                  pad: parseBase64(ciphertext_accumulation.pad),
                  data: parseBase64(ciphertext_accumulation.data),
                },
                crypto_hash: parseBase64(crypto_hash),
                description_hash: parseBase64(description_hash),
                object_id,
                proof: {
                  challenge: parseBase64(proof.challenge),
                  constant: proof.constant,
                  data: parseBase64(proof.data),
                  name: proof.name,
                  pad: parseBase64(proof.pad),
                  response: parseBase64(proof.response),
                  usage: proof.usage,
                },
              }),
            ),
            previous_code: parseBase64(previous_code),
            code: parseBase64(code),
          },
          null,
          2,
        ),
      );

      break;
    }
    case "tally": {
      if (messageSubType === "cast") {
        const { content } = decodedData;

        fs.writeFileSync(
          join(path, ENCRYPTED_TALLY_FILE_NAME),
          JSON.stringify(
            {
              contests: Object.entries(JSON.parse(content)).reduce(
                (
                  result,
                  [contestName, { description_hash, object_id, selections }],
                ) => {
                  result[contestName] = {
                    description_hash: parseBase64(description_hash),
                    object_id,
                    selections: Object.entries(selections).reduce(
                      (
                        result,
                        [
                          selectionName,
                          { object_id, description_hash, ciphertext },
                        ],
                      ) => {
                        result[selectionName] = {
                          ciphertext: {
                            pad: parseBase64(ciphertext.pad),
                            data: parseBase64(ciphertext.data),
                          },
                          description_hash: parseBase64(description_hash),
                          object_id,
                        };
                        return result;
                      },
                      {},
                    ),
                  };
                  return result;
                },
                {},
              ),
              object_id: "election-results",
            },
            null,
            2,
          ),
        );
      }
      break;
    }
    case "end_tally": {
      const { content } = decodedData;

      fs.writeFileSync(
        join(path, TALLY_FILE_NAME),
        JSON.stringify(
          {
            contests: Object.entries(JSON.parse(content)).reduce(
              (result, [contestName, { object_id, selections }]) => {
                result[contestName] = {
                  object_id,
                  selections: Object.entries(selections).reduce(
                    (
                      result,
                      [
                        selectionName,
                        { message, object_id, shares, tally, value },
                      ],
                    ) => {
                      result[selectionName] = {
                        message: {
                          pad: parseBase64(message.pad),
                          data: parseBase64(message.data),
                        },
                        object_id,
                        shares: shares.map(
                          ({ guardian_id, object_id, proof, share }) => ({
                            guardian_id,
                            object_id,
                            proof: {
                              challenge: parseBase64(proof.challenge),
                              data: parseBase64(proof.data),
                              name: proof.name,
                              pad: parseBase64(proof.pad),
                              response: parseBase64(proof.response),
                              usage: proof.usage,
                            },
                            share: parseBase64(share),
                          }),
                        ),
                        tally,
                        value: parseBase64(value),
                      };
                      return result;
                    },
                    {},
                  ),
                };
                return result;
              },
              {},
            ),
            object_id: "election-results",
          },
          null,
          2,
        ),
      );
      break;
    }
    default: {
      break;
    }
  }
};
