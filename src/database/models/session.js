const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    hwId: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    lastHeartBeat: {
      type: String,
      required: true,
    },
    license: { type: mongoose.Schema.Types.ObjectId, ref: "License" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Session", sessionSchema);
