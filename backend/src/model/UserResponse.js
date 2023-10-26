import mongoose from "mongoose";
import StartEndTime from "./StartEndTime.js";

const UserResponseSchema = new mongoose.Schema({
  modules: {
    type: Map,
    of: ModuleResponse.schema,
    required: true,
    default: {},
  },
});

export const Response = mongoose.model("Response", UserResponseSchema);
export default Response;
