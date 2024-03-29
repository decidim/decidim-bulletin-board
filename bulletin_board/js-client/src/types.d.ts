export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Represents untyped JSON */
  JSON: any;
};

export type Client = {
  __typename?: 'Client';
  id: Scalars['ID'];
  name: Scalars['String'];
  publicKey?: Maybe<Scalars['JSON']>;
  publicKeyThumbprint?: Maybe<Scalars['String']>;
  type: Scalars['String'];
};

/** Autogenerated return type of CreateElectionMutation */
export type CreateElectionMutationPayload = {
  __typename?: 'CreateElectionMutationPayload';
  election?: Maybe<Election>;
  error?: Maybe<Scalars['String']>;
};

export type Election = {
  __typename?: 'Election';
  authority: Client;
  id: Scalars['ID'];
  /** Returns the list of log entries for this election in the bulletin board */
  logEntries: Array<LogEntry>;
  status: Scalars['String'];
  title: Scalars['JSON'];
  /** Returns the list of trustees for this election */
  trustees: Array<Client>;
  verifiableResultsHash?: Maybe<Scalars['String']>;
  verifiableResultsUrl?: Maybe<Scalars['String']>;
};


export type ElectionLogEntriesArgs = {
  after?: Maybe<Scalars['String']>;
  types?: Maybe<Array<Scalars['String']>>;
};

/** Autogenerated return type of EndVoteMutation */
export type EndVoteMutationPayload = {
  __typename?: 'EndVoteMutationPayload';
  error?: Maybe<Scalars['String']>;
  pendingMessage?: Maybe<PendingMessage>;
};


export type LogEntry = MessageInterface & {
  __typename?: 'LogEntry';
  chainedHash: Scalars['String'];
  client: Client;
  contentHash?: Maybe<Scalars['String']>;
  decodedData?: Maybe<Scalars['JSON']>;
  election: Election;
  id: Scalars['ID'];
  messageId: Scalars['String'];
  signedData?: Maybe<Scalars['String']>;
};

export type MessageInterface = {
  client: Client;
  election: Election;
  id: Scalars['ID'];
  messageId: Scalars['String'];
  signedData?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createElection?: Maybe<CreateElectionMutationPayload>;
  endVote?: Maybe<EndVoteMutationPayload>;
  processKeyCeremonyStep?: Maybe<ProcessKeyCeremonyStepMutationPayload>;
  processTallyStep?: Maybe<ProcessTallyStepMutationPayload>;
  publishResults?: Maybe<PublishResultsMutationPayload>;
  reportMissingTrustee?: Maybe<ReportMissingTrusteeMutationPayload>;
  resetTestDatabase?: Maybe<ResetTestDatabaseMutationPayload>;
  startKeyCeremony?: Maybe<StartKeyCeremonyMutationPayload>;
  startTally?: Maybe<StartTallyMutationPayload>;
  startVote?: Maybe<StartVoteMutationPayload>;
  vote?: Maybe<VoteMutationPayload>;
};


export type MutationCreateElectionArgs = {
  messageId: Scalars['String'];
  signedData: Scalars['String'];
};


export type MutationEndVoteArgs = {
  messageId: Scalars['String'];
  signedData: Scalars['String'];
};


export type MutationProcessKeyCeremonyStepArgs = {
  messageId: Scalars['String'];
  signedData: Scalars['String'];
};


export type MutationProcessTallyStepArgs = {
  messageId: Scalars['String'];
  signedData: Scalars['String'];
};


export type MutationPublishResultsArgs = {
  messageId: Scalars['String'];
  signedData: Scalars['String'];
};


export type MutationReportMissingTrusteeArgs = {
  messageId: Scalars['String'];
  signedData: Scalars['String'];
};


export type MutationStartKeyCeremonyArgs = {
  messageId: Scalars['String'];
  signedData: Scalars['String'];
};


export type MutationStartTallyArgs = {
  messageId: Scalars['String'];
  signedData: Scalars['String'];
};


export type MutationStartVoteArgs = {
  messageId: Scalars['String'];
  signedData: Scalars['String'];
};


export type MutationVoteArgs = {
  messageId: Scalars['String'];
  signedData: Scalars['String'];
};

export type PendingMessage = MessageInterface & {
  __typename?: 'PendingMessage';
  client: Client;
  election: Election;
  id: Scalars['ID'];
  messageId: Scalars['String'];
  signedData?: Maybe<Scalars['String']>;
  status: Scalars['String'];
};

/** Autogenerated return type of ProcessKeyCeremonyStepMutation */
export type ProcessKeyCeremonyStepMutationPayload = {
  __typename?: 'ProcessKeyCeremonyStepMutationPayload';
  error?: Maybe<Scalars['String']>;
  pendingMessage?: Maybe<PendingMessage>;
};

/** Autogenerated return type of ProcessTallyStepMutation */
export type ProcessTallyStepMutationPayload = {
  __typename?: 'ProcessTallyStepMutationPayload';
  error?: Maybe<Scalars['String']>;
  pendingMessage?: Maybe<PendingMessage>;
};

/** Autogenerated return type of PublishResultsMutation */
export type PublishResultsMutationPayload = {
  __typename?: 'PublishResultsMutationPayload';
  error?: Maybe<Scalars['String']>;
  pendingMessage?: Maybe<PendingMessage>;
};

export type Query = {
  __typename?: 'Query';
  /** Returns a list of authorities in the bulletin board */
  authorities: Array<Client>;
  /** Returns an election given its unique_id */
  election?: Maybe<Election>;
  /** Returns a list of elections in the bulletin board */
  elections: Array<Election>;
  /** Returns the log entry with the given content hash for the given election */
  logEntry?: Maybe<LogEntry>;
  /** Returns the information for this bulletin board instance */
  me: Client;
  /** Returns the information for a given message */
  pendingMessage?: Maybe<PendingMessage>;
};


export type QueryElectionArgs = {
  uniqueId: Scalars['String'];
};


export type QueryLogEntryArgs = {
  contentHash: Scalars['String'];
  electionUniqueId: Scalars['String'];
};


export type QueryPendingMessageArgs = {
  id?: Maybe<Scalars['ID']>;
  messageId?: Maybe<Scalars['String']>;
};

/** Autogenerated return type of ReportMissingTrusteeMutation */
export type ReportMissingTrusteeMutationPayload = {
  __typename?: 'ReportMissingTrusteeMutationPayload';
  error?: Maybe<Scalars['String']>;
  pendingMessage?: Maybe<PendingMessage>;
};

/** Autogenerated return type of ResetTestDatabaseMutation */
export type ResetTestDatabaseMutationPayload = {
  __typename?: 'ResetTestDatabaseMutationPayload';
  timestamp: Scalars['Int'];
};

/** Autogenerated return type of StartKeyCeremonyMutation */
export type StartKeyCeremonyMutationPayload = {
  __typename?: 'StartKeyCeremonyMutationPayload';
  error?: Maybe<Scalars['String']>;
  pendingMessage?: Maybe<PendingMessage>;
};

/** Autogenerated return type of StartTallyMutation */
export type StartTallyMutationPayload = {
  __typename?: 'StartTallyMutationPayload';
  error?: Maybe<Scalars['String']>;
  pendingMessage?: Maybe<PendingMessage>;
};

/** Autogenerated return type of StartVoteMutation */
export type StartVoteMutationPayload = {
  __typename?: 'StartVoteMutationPayload';
  error?: Maybe<Scalars['String']>;
  pendingMessage?: Maybe<PendingMessage>;
};

/** Autogenerated return type of VoteMutation */
export type VoteMutationPayload = {
  __typename?: 'VoteMutationPayload';
  error?: Maybe<Scalars['String']>;
  pendingMessage?: Maybe<PendingMessage>;
};
