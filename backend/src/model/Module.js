import mongoose from "mongoose";
import Scenario from "./Scenario.js";
import ScenarioResponse from "./Scenario.js";
import { validateModuleId } from "../util/validators.js";

const ModuleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => {
        return validateModuleId(v);
      },
    },
  },
  scenarios: {
    type: Map,
    of: Scenario.schema,
    required: true,
    default: {},
  },
  type: {
    type: String,
    required: true,
    enum: ["HA", "AM"],
  },
  testing: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const ModuleResponseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => {
        return validateModuleId(v);
      },
    },
  },
  scenarios: {
    type: Map,
    of: ScenarioResponse.schema,
    required: true,
    default: {},
  },
  type: {
    type: String,
    required: true,
    enum: ["intersection", "rearends", "curves", "testing"],
  },
  testing: {
    type: Boolean,
    required: true,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
    required: true,
  },
  isStarted: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const Module = mongoose.model("Module", ModuleSchema);
const ModuleResponse = mongoose.model("ModuleResponse", ModuleSchema);

export default Module;
