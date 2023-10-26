import mongoose from "mongoose";
import { UserRole } from "./UserRole.js";
import Module from "./Module.js";
import { validateEmail } from "../util/validators.js";

const DeviceSchema = new mongoose.Schema({
  deviceInfo: {
    type: String,
  },
  requestTimes: {
    type: Array,
    of: Date,
    default: [],
  },
});

const UserSchema = new mongoose.Schema({
  participantId: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (v) => {
        return validateEmail(v);
      },
    },
  },
  password: {
    type: String,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true,
    default: UserRole.Student,
  },
  dateJoined: {
    type: Date,
    required: true,
    default: new Date(0),
  },
  dateResetPwUrlCreated: {
    type: Date,
    required: true,
    default: new Date(0),
  },
  isActivated: {
    type: Boolean,
    default: false,
  },
  drivingLicenseId: {
    type: String,
    unique: true,
  },
  modules: {
    type: Map,
    of: Module.schema,
    required: true,
    default: {},
  },
  devices: {
    type: Array,
    of: DeviceSchema,
    required: false,
    default: [],
  },
  userResponse: {
    type: Map,
    of: Response.schema,
    required: false,
    default: {},
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
