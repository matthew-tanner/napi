const mongoose = require("mongoose");

module.exports.connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log("Connected to MongoDB...");
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports.isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};
