const { combineResolvers } = require("graphql-resolvers");

const License = require("../database/models/license");
const User = require("../database/models/user");
const Session = require("../database/models/session");

const { isAuthenticated, isLicenseOwner, isAdmin } = require("./middleware");

module.exports = {
  Query: {
    sessions: combineResolvers(isAuthenticated, isLicenseOwner, async (_, { hwId, license, token }) => {
      try {
        let sessions = {};
        let licenseId = "";
        if (hwId) {
          sessions = Session.find({ hwId: hwId });
        } else if (license) {
          sessions = Session.find({ license: license });
        } else if (token) {
          let licenseLookUp = License.findOne({ token: token });
          licenseId = licenseLookUp.id;
          sessions = Session.find({ licenseId });
        }
        if (!sessions) {
          throw new Error("No sessions found");
        }
        return sessions;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
    session: combineResolvers(isAuthenticated, isLicenseOwner, async (_, { id }) => {
      try {
        let session = {};
        if (id) {
          session = await Session.findById(id);
        }
        if (!session) {
          throw new Error("Session not found");
        }
        return session;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
  },
  Mutation: {
    createSession: combineResolvers(isAuthenticated, isAdmin, async (_, { licenseId, token, input }) => {
      try {
        let license = {};
        if (licenseId) {
          license = await License.findById(licenseId);
        } else if (token) {
          license = await License.findOne({ token: token });
        }
        if (!license) {
          throw new Error("License not found");
        }
        const newHB = new Date();
        input.lastHeartBeat = newHB.toISOString();
        input.license = license.id;
        const session = new Session({
          ...input,
        });
        const result = await session.save();
        return result;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
    updateSession: combineResolvers(isAuthenticated, isAdmin, async (_, { id }) => {
      try {
        let session = {};
        if (id) {
          session = await Session.findById(id);
        }
        if (!session) {
          throw new Error("Session not found");
        }
        const newHB = new Date().toISOString();
        const sessionUpdate = await Session.findByIdAndUpdate(session.id, { lastHeartBeat: newHB }, { new: true });
        return sessionUpdate;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
    deleteSession: combineResolvers(isAuthenticated, isAdmin, async (_, { id }) => {
      try {
        const session = await Session.findByIdAndDelete(id);
        return session;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
  },
  Session: {
    license: async (parent, _, { loaders }) => {
      try {
        const license = await License.findById(parent.license);
        return license;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};
