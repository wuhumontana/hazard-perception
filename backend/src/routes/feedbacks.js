import express from "express";
import FeedbackDao from "../data/FeedbackDao.js";

const Feedback = express.Router();
const feedbackDao = new FeedbackDao();

Feedback.get("/", async (req, res, next) => {
  try {
    let feedbacks;
    if (req.query.participantId) {
      feedbacks = await feedbackDao.findFeedBackByParticipantId(
        req.query.participantId
      );
    } else {
      feedbacks = await feedbackDao.findAllFeedbacks();
    }
    res.json({
      status: 200,
      message: "Feedbacks retrieved",
      data: feedbacks,
    });
  } catch (err) {
    next(err);
  }
});

Feedback.get("/:id/", async (req, res, next) => {
  try {
    const id = req.params.id;
    const feedback = await feedbackDao.findFeedBackById(id);
    res.json({
      status: 200,
      message: "Feedback retrieved",
      data: feedback,
    });
  } catch (err) {
    next(err);
  }
});

Feedback.post("/", async (req, res, next) => {
  try {
    const feedback = await feedbackDao.createFeedback(
      req.user,
      req.body.type,
      req.body.content,
      req.body.moduleId,
      req.body.scenarioId,
      req.body.activityId,
      req.body.entrance,
      req.body.isProfileEntry
    );
    res.json({
      status: 200,
      message: "Feedback submitted successfully！",
      data: feedback,
    });
  } catch (err) {
    next(err);
  }
});

export default Feedback;
