import ApolloClient from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import fetch from "node-fetch";
import InMemoryCache from "apollo-cache-inmemory";
import gql from "graphql-tag";

/**
 * This class includes some methods to perform requests to the Bulletin Board
 * server GraphQL API.
 * @class
 */
export class BulletinBoardClient {
  /**
   * Creates and configures the Apollo client.
   *
   * @constructor
   * @param {String} apiUrl - the url of the GraphQL API.
   */
  constructor(apiUrl) {
    const httpLink = createHttpLink({
      uri: apiUrl,
      fetch,
    });

    this.client = new ApolloClient.ApolloClient({
      link: httpLink,
      cache: new InMemoryCache.InMemoryCache(),
    });
  }

  /**
   * Query the election log entries and returns the decoded data of the messages
   * that are necessary to encrypt a vote.
   *
   * @param {String} electionUniqueId - the election unique id.
   * @returns {Object} - an object that contains the decoded data of the messages.
   */
  async getMessagesToAuditBallot(electionUniqueId) {
    const { data } = await this.client.query({
      query: gql`
        query {
          election(uniqueId: "${electionUniqueId}") {
            logEntries(types: ["create_election", "end_key_ceremony"]) {
              messageId
              decodedData
            }
          }
        }
      `,
    });

    const [
      createElectionLogEntry,
      endKeyCeremonyLogEntry,
    ] = data.election.logEntries;

    return {
      createElectionMessage: createElectionLogEntry.decodedData,
      endKeyCeremonyMessage: endKeyCeremonyLogEntry.decodedData,
    };
  }
}
