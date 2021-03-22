const { gql } = require("apollo-server-express");

module.exports = gql`
  extend type Query {
    licenses(cursor: String, limit: Int): LicenseFeed!
    license(id: ID!, token: String): License
  }

  extend type Mutation {
    createLicense(id: ID, email: String, username: String): License
    updateLicense(id: ID, email: String, username: String, input: updateLicenseInput!): License
    deleteLicense(id: ID!): License
  }

  input createLicenseInput {
    btc: String!
    expiration: String!
  }

  input updateLicenseInput {
    btc: String!
    expiration: String!
  }

  type License {
    id: ID!
    token: String!
    btc: String!
    expiration: Date!
    isActive: Boolean!
    user: User!
    totalSessions: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  type LicenseFeed {
    licenseFeed: [License!]
    pageInfo: PageInfo!
  }

  type PageInfo {
    nextPageCursor: String
    hasNextPage: Boolean
  }
`;
