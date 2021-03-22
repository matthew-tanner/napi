const userResolver = require("./user");
const licenseResolver = require("./license");
const sessionResolver = require("./session");
const { GraphQLDateTime } = require("graphql-iso-date");

const customDateScalarResolver = {
  Date: GraphQLDateTime,
};

module.exports = [userResolver, licenseResolver, sessionResolver, customDateScalarResolver];
