import { Trustee } from "./trustee";
import { Client } from "../client/client";
import { Election } from "../election/election";

/**
 * This class is used to bind any UI elements to a trustee process.
 * @abstract
 */
export class TrusteeComponent {
  /**
   * Initialises the class with the given params.
   * @param {Object} params - An object that contains the initialization params.
   *  - {String} authorityPublicKeyJSON - The authority identification public key.
   *  - {String} trusteeUniqueId - The unique identifier of a trustee.
   *  - {Object} trusteeIdentificationKeys - An object that contains both the public and private key for
   *                                         the corresponding trustee.
   *  - {Object} trusteeWrapperAdapter - An object to interact with the trustee wrapper.
   * @constructor
   */
  constructor({
    authorityPublicKeyJSON,
    trusteeUniqueId,
    trusteeIdentificationKeys,
    trusteeWrapperAdapter,
  }) {
    this.trustee = new Trustee({
      uniqueId: trusteeUniqueId,
      authorityPublicKeyJSON,
      identificationKeys: trusteeIdentificationKeys,
      wrapperAdapter: trusteeWrapperAdapter,
    });
  }

  /**
   * Setup the election for the trustee.
   *
   * @abstract
   * @returns {Promise<undefined>}
   */
  async setupElection() {
    throw new Error("not implemented");
  }

  /**
   * Setup the election for the trustee.
   *
   * @param {Object} params - An object that contains the initialization params.
   *  - {Object} bulletinBoardClientParams - An object to configure the bulletin board client.
   *  - {String} electionUniqueId - The unique identifier of an election.
   *  - {Number} authorizationExpirationTimestamp - The timestamp until the authorization header is no longer valid.
   *  - {Array<String>} typesFilter - A collection of message ids to be included in the log entry query.
   *
   * @returns {Promise<undefined>}
   */
  async setupElectionWithTypesFilter({
    bulletinBoardClientParams,
    electionUniqueId,
    authorizationExpirationTimestamp,
    typesFilter,
  }) {
    const [authorityId] = electionUniqueId.split(".");
    const trusteeUniqueIdHeader = `${authorityId}.${this.trustee.uniqueId}`;
    const authorizationHeader = await this.trustee.signMessage({
      trustee_unique_id: trusteeUniqueIdHeader,
      exp: authorizationExpirationTimestamp,
    });

    const bulletinBoardClient = new Client({
      ...bulletinBoardClientParams,
      headers: {
        Authorization: authorizationHeader,
        TrusteeUniqueId: trusteeUniqueIdHeader,
      },
    });

    const election = new Election({
      uniqueId: electionUniqueId,
      bulletinBoardClient,
      typesFilter,
    });

    this.trustee.election = election;
  }

  /**
   * Bind UI events to the key ceremony process.
   *
   * @abstract
   * @returns {Promise<undefined>}
   */
  async bindEvents() {
    throw new Error("not implemented");
  }
}
