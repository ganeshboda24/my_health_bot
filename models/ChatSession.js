const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: {
        values: ["user", "bot"],
        message: "Message role must be user or bot"
      },
      required: [true, "Message role is required"]
    },
    text: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"]
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: [true, "Member reference is required"],
      index: true
    },
    language: {
      type: String,
      enum: ["en", "te"],
      default: "en"
    },
    messages: {
      type: [messageSchema],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 200,
        message: "Chat session cannot exceed 200 messages"
      }
    }
  },
  {
    timestamps: true
  }
);

chatSessionSchema.index({ memberId: 1, createdAt: -1 });

module.exports = mongoose.model("ChatSession", chatSessionSchema);