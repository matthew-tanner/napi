const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { combineResolvers } = require("graphql-resolvers");

const User = require("../database/models/user");
const License = require("../database/models/license");
const { isAuthenticated, isAdmin } = require("./middleware");
const PubSub = require("../subscription");
const { userEvents } = require("../subscription/events");

module.exports = {
  Query: {
    adminGetAllUsers: combineResolvers(isAuthenticated, isAdmin, async () => {
      try {
        const users = await User.find();
        if (!users) {
          throw new Error("No users found");
        }
        return users;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
    user: combineResolvers(isAuthenticated, async (_, __, { email }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("User not found");
        }
        return user;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
    adminGetUser: combineResolvers(isAuthenticated, isAdmin, async (_, { id, email, username }) => {
      try {
        let user = {};
        if (id) {
          user = await User.findById(id);
        } else if (email) {
          user = await User.findOne({ email: email });
        } else if (username) {
          user = await User.findOne({ username: username });
        }
        if (!user) {
          throw new Error("User not found");
        }
        return user;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
  },
  Mutation: {
    signup: async (_, { input }) => {
      try {
        const userEmail = await User.findOne({ email: input.email });
        if (userEmail) {
          throw new Error("Email in use");
        }
        const userUsername = await User.findOne({ username: input.username });
        if (userUsername) {
          throw new Error("Username in use");
        }

        const hashedPass = await bcrypt.hash(input.password, 12);
        const newUser = new User({ ...input, password: hashedPass, isAdmin: false, isVerified: false });
        const result = await newUser.save();
        PubSub.publish(userEvents.USER_CREATED, {
          userCreated: result,
        });
        return result;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    login: async (_, { input }) => {
      try {
        const user = await User.findOne({ email: input.email });
        if (!user) {
          throw new Error("email or incorrect");
        }
        const isPasswordValid = await bcrypt.compare(input.password, user.password);
        if (!isPasswordValid) {
          throw new Error("email / password incorrect");
        }
        const secret = process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ email: user.email }, secret, { expiresIn: "1d" });
        return { token };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    updateUser: combineResolvers(isAuthenticated, async (_, { input }, { email, loggedInUserId }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("User not found");
        }
        const hashedPass = await bcrypt.hash(input.password, 12);
        const userUpdate = await User.findByIdAndUpdate(
          loggedInUserId,
          { ...input, password: hashedPass },
          { new: true }
        );
        return userUpdate;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
    adminUpdateUser: combineResolvers(isAuthenticated, isAdmin, async (_, { id, email, username, input }) => {
      try {
        let user = {};
        if (id) {
          user = await User.findById(id);
        } else if (email) {
          user = await User.findOne({ email: email });
        } else if (username) {
          user = await User.findOne({ username: username });
        }
        if (!user) {
          throw new Error("User not found");
        }
        const userUpdate = await User.findByIdAndUpdate(user.id, { ...input }, { new: true });
        return userUpdate;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
  },
  Subscription: {
    userCreated: {
      subscribe: () => PubSub.asyncIterator(userEvents.USER_CREATED),
    },
  },
  User: {
    licenses: async ({ id }) => {
      try {
        const license = await License.find({ user: id });
        return license;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};
