const { gql } = require("apollo-server-express");

module.exports = gql`
  extend type Query {
    user: User
    adminGetAllUsers: [User]
    adminGetUser(id: ID, email: String, username: String): User
  }

  extend type Mutation {
    signup(input: singupInput): User
    login(input: loginInput): Token
    updateUser(input: updateUserInput): User
    adminUpdateUser(id: ID, email: String, username: String, input: adminUpdateUserInput): User
  }

  extend type Subscription {
    userCreated: User
  }

  input loginInput {
    email: String!
    password: String!
  }

  input singupInput {
    username: String!
    email: String!
    password: String!
  }

  input updateUserInput {
    password: String!
    email: String!
  }

  input adminUpdateUserInput {
    isVerified: Boolean
    isAdmin: String
  }

  type Token {
    token: String!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    isVerified: Boolean
    isAdmin: Boolean
    licenses: [License!]
    createdAt: Date!
    updatedAt: Date!
  }
`;
