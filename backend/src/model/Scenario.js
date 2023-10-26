import mongoose from "mongoose";
import {
  validateActivityId,
  validateScenarioId,
  validateScenarioType,
} from "../util/validators.js";
import StartEndTime from "./StartEndTime.js";

const CoordinateSchema = new mongoose.Schema({
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
});

const MaintenanceActivitySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  videoLength: {
    type: Number,
    required: true,
  },
  rearviewNotAllowed: {
    type: Map,
    of: StartEndTime.schema,
    default: {},
    required: true,
  },
  correctGridResponse: {
    type: Number,
    default: 0,
    required: true,
  },
});

const ActivitySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    enum: ["S", "T"],
    validate: {
      validator: (v) => {
        return validateActivityId(v);
      },
    },
  },
  hitboxCoordinates: {
    type: CoordinateSchema,
    required: true,
  },
  hitboxRadii: {
    type: CoordinateSchema,
    required: true,
  },
});

const ScenarioSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => {
        return validateScenarioId(v);
      },
    },
  },
  activities: {
    type: Map,
    of: ActivitySchema,
    required: true,
    default: {},
  },
  maintenanceActivities: {
    type: Map,
    of: MaintenanceActivitySchema,
    required: true,
    default: {},
  },
  type: {
    type: String,
    required: true,
    enum: ["HA", "AM"],
    validate: {
      validator: (v) => {
        return validateScenarioType(v);
      },
    },
  },
});

const MaintenanceActivityResponseSchema = new mongoose.Schema({
  gridResponses: {
    type: Array,
    of: Number,
    required: true,
  },
  responseStartTimes: {
    type: Array,
    of: Date,
    default: [],
    required: true,
  },
  responseEndTimes: {
    type: Array,
    of: Date,
    default: [],
    required: true,
  },
  lastCorrectIndex: {
    type: Number,
    default: -1,
    required: true,
  },
});

const ActivityResponseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    enum: ["S", "T"],
    validate: {
      validator: (v) => {
        return validateActivityId(v);
      },
    },
  },
  isCompleted: {
    type: Boolean,
    default: false,
    required: true,
  },
  hitboxCoordinatesResponses: {
    type: Array,
    of: CoordinateSchema,
    default: [],
    required: true,
  },
  responseStartTimes: {
    type: Array,
    of: Date,
    default: [],
    required: true,
  },
  responseEndTimes: {
    type: Array,
    of: Date,
    default: [],
    required: true,
  },
  lastCorrectIndex: {
    type: Number,
    default: -1,
    required: true,
  },
});

const ScenarioResponseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => {
        return validateScenarioId(v);
      },
    },
  },
  activities: {
    type: Map,
    of: ActivityResponseSchema,
    required: true,
    default: {},
  },
  maintenanceActivities: {
    type: Map,
    of: MaintenanceActivityResponseSchema,
    required: true,
    default: {},
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  isStarted: {
    type: Boolean,
    default: false,
  }
});

export const Coordinate = mongoose.model("Coordinate", CoordinateSchema);
export const Activity = mongoose.model("Activity", ActivitySchema);
export const MaintenanceActivity = mongoose.model(
  "MaintenanceActivity",
  MaintenanceActivitySchema
);
const Scenario = mongoose.model("Scenario", ScenarioSchema);
export const ActivityResponse = mongoose.model(
  "ActivityResponse",
  ActivityResponseSchema
);
export const MaintenanceActivityResponse = mongoose.model(
  "MaintenanceActivityResponse",
  MaintenanceActivityResponseSchema
);
const ScenarioResponse = mongoose.model(
  "ScenarioResponse",
  ScenarioResponseSchema
);

export default Scenario;
