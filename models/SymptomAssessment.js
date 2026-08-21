const mongoose = require("mongoose");

const symptomAssessmentSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: [true, "Member reference is required"],
      index: true
    },
    symptoms: {
      type: [String],
      required: [true, "Symptoms are required"],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one symptom is required"
      }
    },
    symptomText: {
      type: String,
      trim: true,
      maxlength: [2000, "Symptom description cannot exceed 2000 characters"]
    },
    triageLevel: {
      type: String,
      enum: {
        values: ["LOW", "MEDIUM", "HIGH", "EMERGENCY"],
        message: "Triage level must be LOW, MEDIUM, HIGH, or EMERGENCY"
      },
      required: [true, "Triage level is required"],
      index: true
    },
    recommendation: {
      type: String,
      required: [true, "Recommendation is required"]
    },
    language: {
      type: String,
      enum: ["en", "te"],
      default: "en"
    }
  },
  {
    timestamps: true
  }
);

symptomAssessmentSchema.index({ memberId: 1, createdAt: -1 });

module.exports = mongoose.model("SymptomAssessment", symptomAssessmentSchema);