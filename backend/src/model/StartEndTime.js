import mongoose from "mongoose";

const StartEndTimeSchema = new mongoose.Schema({
  start: {
    type: Number,
    required: true,
  },
  end: {
    type: Number,
    required: true,
  },
});

export const StartEndTime = mongoose.model("StartEndTime", StartEndTimeSchema);

export default StartEndTime;
