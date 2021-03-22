const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      required: false,
    },
    isAdmin: {
      type: Boolean,
      required: false,
    },
    licenses: [{ type: mongoose.Schema.Types.ObjectId, ref: "License" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
