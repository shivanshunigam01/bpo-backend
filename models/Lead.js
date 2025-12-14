const mongoose = require("mongoose");

const callLogSchema = new mongoose.Schema(
  {
    callId: String,
    startAt: Date,
    endAt: Date,
    durationSec: Number,
    outcome: String,
    notes: String,
    recordingUrl: String,
    meta: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, required: true },
    city: { type: String, trim: true },
    place: { type: String, trim: true },
    status: {
      type: String,
      enum: ["New", "Attempted", "Connected", "Not Interested", "Follow-up", "Converted", "Wrong Number", "Call Later", "Invalid"],
      default: "New",
    },
    notes: { type: String, trim: true },
    customFields: { type: Object, default: {} },
    attempts: { type: Number, default: 0 },
    lastCallAt: { type: Date },
    nextFollowUpAt: { type: Date },
    callLogs: { type: [callLogSchema], default: [] },
  },
  { timestamps: true }
);

leadSchema.index({ phone: 1 });

module.exports = mongoose.model("Lead", leadSchema);
