const mongoose = require("mongoose");

const licenseSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    btc: {
      type: String,
      require: true,
    },
    expiration: {
      type: String,
      required: true,
    },
    totalSessions: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: false,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Session" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("License", licenseSchema);
