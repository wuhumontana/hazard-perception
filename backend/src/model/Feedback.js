import mongoose from "mongoose";
import {
  validateActivityId,
  validateModuleId,
  validateScenarioId,
} from "../util/validators.js";

const FeedbackSchema = new mongoose.Schema({
  participantId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["Bug Report", "Suggestion", "Other", "Support"],
  },
  content: {
    type: String,
    required: true,
  },
  dateSubmitted: {
    type: Date,
    required: true,
  },
  moduleId: {
    type: String,
    validate: {
      validator: (v) => {
        return validateModuleId(v);
      },
    },
  },
  scenarioId: {
    type: String,
    validate: {
      validator: (v) => {
        return validateScenarioId(v);
      },
    },
  },
  activityId: {
    type: String,
    validate: {
      validator: (v) => {
        return validateActivityId(v);
      },
    },
  },
  isProfileEntry: {
    type: Boolean,
    default: false,
  },
});

const Feedback = mongoose.model("Feedback", FeedbackSchema);

export default Feedback;
