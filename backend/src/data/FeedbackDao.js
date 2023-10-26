import Feedback from "../model/Feedback.js";
import ApiError from "../model/ApiError.js";
import sendEmail from "../util/nodemailer.js";
import feedbackSupport from "../emails/feedbackSupport.js";
import feedbackUser from "../emails/feedbackUser.js";
import moment from "moment";
import {
  validateType,
  validateContent,
  validateModuleId,
  validateScenarioId,
  validateActivityId,
  validateEntrance,
} from "../util/validators.js";

class FeedbackDao {
  async createFeedback(
    user,
    type,
    content,
    moduleId,
    scenarioId,
    activityId,
    entrance,
    isProfileEntry
  ) {
    if (!validateEntrance(entrance))
      throw new ApiError(400, "Invalid entrance!", "entrance");
    if (!validateType(type)) throw new ApiError(400, "Invalid type!", "type");
    if (!validateContent(content))
      throw new ApiError(
        400,
        "The length of content must be between 10 and 1000!",
        "content"
      );
    if (!isProfileEntry) {
      validateModuleId(moduleId);
      validateScenarioId(scenarioId);
      validateActivityId(activityId);
    }

    const participantId = user.participantId;
    const dateSubmitted = moment().format("YYYY-MM-DD HH:mm:ss");
    const newFeedback = new Feedback({
      participantId,
      type,
      content,
      dateSubmitted,
      moduleId,
      scenarioId,
      activityId,
      isProfileEntry,
    });
    await newFeedback.save();

    await sendEmail(
      process.env.EMAIL_ACCOUNT,
      "【User Feedback】" + type + "",
      "",
      feedbackSupport(entrance, participantId, user.email, type, content)
    );

    await sendEmail(
      user.email,
      "Hazard Perception | Submitted successfully",
      "",
      feedbackUser(entrance, type, content)
    );
    return newFeedback;
  }

  async findAllFeedbacks() {
    const feedbacks = await Feedback.find();
    return feedbacks;
  }

  async findFeedBackByParticipantId(participantId) {
    const feedbacks = await Feedback.find({ participantId: participantId });
    return feedbacks;
  }

  async findFeedBackById(id) {
    const feedback = await Feedback.findOne({ _id: id });
    return feedback;
  }
}

export default FeedbackDao;
