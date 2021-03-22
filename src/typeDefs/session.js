const { gql } = require("apollo-server-express");

module.exports = gql`
  extend type Query {
    sessions(token: String, hwId: ID, license: ID): [Session]
    session(id: ID!): Session
  }

  extend type Mutation {
    createSession(licenseId: ID, token: String, input: createSessionInput!): Session
    updateSession(id: ID): Session
    deleteSession(id: ID!): Session
  }

  input createSessionInput {
    hwId: String!
    ipAddress: String!
    lastHeartBeat: Date
    license: String
  }

  type Session {
    id: ID!
    hwId: String!
    ipAddress: String!
    lastHeartBeat: Date!
    license: License!
    createdAt: Date!
    updatedAt: Date!
  }
`;
