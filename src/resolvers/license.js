const { combineResolvers } = require("graphql-resolvers");
const crypto = require("crypto");

const License = require("../database/models/license");
const User = require("../database/models/user");
const { isAuthenticated, isLicenseOwner, isAdmin } = require("./middleware");
const { stringToBase64, base64ToString } = require("../helpers");

module.exports = {
  Query: {
    licenses: combineResolvers(isAuthenticated, async (_, { cursor, limit = 10 }, { loggedInUserId }) => {
      try {
        const query = { user: loggedInUserId };
        if (cursor) {
          query["_id"] = {
            $lt: base64ToString(cursor),
          };
        }
        let licenses = await License.find(query)
          .sort({ _id: -1 })
          .limit(limit + 1);
        const hasNextPage = licenses.length > limit;
        licenses = hasNextPage ? licenses.slice(0, -1) : licenses;
        return {
          licenseFeed: licenses,
          pageInfo: {
            nextPageCursor: hasNextPage ? stringToBase64(licenses[licenses.length - 1].id) : null,
            hasNextPage,
          },
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
    license: combineResolvers(isAuthenticated, isLicenseOwner, async (_, { id, token }) => {
      try {
        let license = {};
        if (id) {
          license = await License.findById(id);
        } else if (token) {
          license = await License.findOne({ token: token });
        }
        if (!license) {
          throw new Error("License not found");
        }
        return license;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
  },
  Mutation: {
    createLicense: combineResolvers(isAuthenticated, async (_, { id, email, username }) => {
      try {
        let user = {};
        if (id) {
          user = await User.findById(id);
        } else if (email) {
          user = await User.findOne({ email });
        } else if (username) {
          user = await User.findOne({ username });
        }
        if (!user) {
          throw new Error("User not found");
        }
        // This is auto data for now so we can test
        const newToken = "DR" + crypto.randomBytes(11).toString("hex");
        const newBTC = crypto.randomBytes(8).toString("hex");
        var expDate = new Date();
        expDate.setDate(expDate.getDate() + 30);
        const license = new License({
          btc: newBTC,
          expiration: expDate.toISOString(),
          isActive: false,
          user: user.id,
          totalSessions: 5,
          token: newToken,
        });
        const result = await license.save();
        user.licenses.push(result.id);
        await user.save();
        return result;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
    updateLicense: combineResolvers(isAuthenticated, isAdmin, async (_, { id, email, username, input }) => {
      try {
        let license = {};
        if (id) {
          license = await License.findById(id);
        } else if (email) {
          license = await License.findOne({ email: email });
        } else if (username) {
          license = await License.findOne({ username: username });
        }
        if (!license) {
          throw new Error("User not found");
        }
        const licenseUpdate = await License.findByIdAndUpdate(license.id, { ...input }, { new: true });
        return licenseUpdate;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
    deleteLicense: combineResolvers(isAuthenticated, isAdmin, async (_, { id }, { loggedInUserId }) => {
      try {
        const license = await License.findByIdAndDelete(id);
        await User.updateOne({ _id: loggedInUserId }, { $pull: { licenses: license.id } });
        return license;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
  },
  License: {
    user: async (parent, _, { loaders }) => {
      try {
        const user = await loaders.user.load(parent.user.toString());
        return user;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};
