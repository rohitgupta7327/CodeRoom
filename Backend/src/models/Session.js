import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    problem: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    callId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "incomplete"],
      default: "active",
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);

export default Session;
