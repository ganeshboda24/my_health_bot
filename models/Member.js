const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"]
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Phone number must be a valid 10-digit Indian mobile number"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false
    },
    role: {
      type: String,
      enum: {
        values: ["MEMBER", "HEALTH_WORKER", "ADMIN"],
        message: "Role must be MEMBER, HEALTH_WORKER, or ADMIN"
      },
      default: "MEMBER"
    },
    preferredLanguage: {
      type: String,
      enum: ["en", "te"],
      default: "en"
    },
    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
      max: [120, "Age cannot exceed 120"]
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Strip sensitive fields whenever a member is serialized to JSON
memberSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

memberSchema.set("toObject", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("Member", memberSchema);