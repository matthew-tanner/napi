const { skip } = require("graphql-resolvers");
const User = require("../../database/models/user");
const License = require("../../database/models/license");
const { isValidObjectId } = require("../../database/utils");
const { AuthenticationError } = require("apollo-server-express");

module.exports.isAuthenticated = (_, __, { email }) => {
  if (!email) {
    throw new AuthenticationError("Access denied...");
  }
  return skip;
};

module.exports.isAdmin = async (_, __, { loggedInUserId, loggedInUserIp }) => {
  try {
    const admin = await User.findOne({ _id: loggedInUserId, isAdmin: true });
    if (!admin) {
      console.log(loggedInUserIp);
      throw new AuthenticationError("Not Authorized");
    }
    return skip;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports.isLicenseOwner = async (_, { id, token }, { loggedInUserId }) => {
  try {
    let license = {};
    if (token) {
      license = await License.findOne({ token: token });
    } else if (id) {
      if (!isValidObjectId(id)) {
        throw new Error("Invalid License id");
      }
      license = await License.findById(id);
    }
    if (!license) {
      throw new Error("License not found");
    } else if (license.user.toString() !== loggedInUserId) {
      throw new Error("Not authorized as license owner");
    }
    return skip;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
