const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
const DataLoader = require("dataloader");
const depthLimit = require("graphql-depth-limit");
const dotEnv = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const winston = require("winston");

dotEnv.config();

const PORT = process.env.PORT || 3000;
const app = express();
const { connection } = require("./database/utils");
const { verifyUser } = require("./helpers/context");
const loaders = require("./loaders");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.colorize(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: "api-error.log", level: "error" }),
    new winston.transports.File({ filename: "api-combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

// TODO - this is only for heroku
app.set("trusted proxy", 1);

const limiter = rateLimit({
  windowMs: 1000,
  max: 5,
});

connection();

const BASIC_LOGGING = {
  requestDidStart(requestContext) {
    console.log("request started");
    console.log(requestContext.request.query);
    console.log(requestContext.request.variables);
    return {
      didEncounterErrors(requestContext) {
        console.log("an error happened in response to query " + requestContext.request.query);
        console.log(requestContext.errors);
      },
    };
  },

  willSendResponse(requestContext) {
    console.log("response sent", requestContext.response);
  },
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [BASIC_LOGGING],
  context: async ({ req }) => {
    const contextObj = {};
    if (req) {
      await verifyUser(req);
      contextObj.loggedInUserIp = req.ip;
      contextObj.email = req.email;
      contextObj.loggedInUserId = req.loggedInUserId;
    }
    contextObj.loaders = {
      user: new DataLoader((keys) => loaders.user.batchUsers(keys)),
    };
    return contextObj;
  },
  validationRules: [depthLimit(4)],
  formatError: (err) => {
    return {
      message: err.message,
    };
  },
  playground: false,
});

app.use(limiter);
apolloServer.applyMiddleware({ app, path: "/api" });
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/", (req, res, next) => {
  res.send();
});

const httpServer = app.listen(PORT, () => {
  logger.info(`server listening on PORT: ${PORT}`);
  logger.info(`GraphQL access: ${apolloServer.graphqlPath}`);
});

apolloServer.installSubscriptionHandlers(httpServer);
