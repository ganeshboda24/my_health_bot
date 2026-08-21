const mongoose = require("mongoose");

const phcSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "PHC name is required"],
      trim: true,
      maxlength: [200, "PHC name cannot exceed 200 characters"]
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
      maxlength: [100, "District cannot exceed 100 characters"],
      index: true
    },
    mandal: {
      type: String,
      required: [true, "Mandal is required"],
      trim: true,
      maxlength: [100, "Mandal cannot exceed 100 characters"]
    },
    type: {
      type: String,
      enum: {
        values: ["PHC", "CHC", "DH", "UHC", "AH"],
        message: "Type must be PHC, CHC, DH, UHC, or AH"
      },
      default: "PHC"
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone cannot exceed 20 characters"],
      default: ""
    },
    latitude: {
      type: String,
      trim: true,
      default: ""
    },
    longitude: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

phcSchema.index({ district: 1, mandal: 1 });

module.exports = mongoose.model("PHC", phcSchema);
