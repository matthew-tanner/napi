const { gql } = require("apollo-server-express");

const userTypeDefs = require("./user");
const licenseTypeDefs = require("./license");
const sessionTypeDefs = require("./session");

const typeDefs = gql`
  scalar Date

  type Query {
    _: String
  }
  type Mutation {
    _: String
  }
  type Subscription {
    _: String
  }
`;

module.exports = [typeDefs, userTypeDefs, licenseTypeDefs, sessionTypeDefs];
