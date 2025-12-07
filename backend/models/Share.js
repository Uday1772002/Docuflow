const mongoose = require("mongoose");

const shareSchema = new mongoose.Schema({
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  shareType: {
    type: String,
    enum: ["user", "link"],
    required: true,
  },
  // For user-based sharing
  sharedWith: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  // For link-based sharing
  shareLink: {
    type: String,
    unique: true,
    sparse: true,
  },
  // Access control
  role: {
    type: String,
    enum: ["viewer", "editor"],
    default: "viewer",
  },
  // Optional expiry
  expiresAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Audit log
  accessLog: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      action: {
        type: String,
        enum: ["view", "download"],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Index for faster queries
shareSchema.index({ file: 1, owner: 1 });
shareSchema.index({ sharedWith: 1 });
shareSchema.index({ expiresAt: 1 });

// Check if share is expired
shareSchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

module.exports = mongoose.model("Share", shareSchema);
