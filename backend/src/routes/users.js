import express from "express";
import UserDao from "../data/UserDao.js";
import ModuleDao from "../data/ModuleDao.js";
import ApiError from "../model/ApiError.js";
import { UserRole } from "../model/UserRole.js";
import {
  createToken,
  verifyToken,
  checkResearcherPermission,
  checkUserPermission,
  loginLimiter,
} from "../util/token.js";
import { comparePassword, hashPassword } from "../util/password.js";

import sendEmail from "../util/nodemailer.js";
import forgotPasswordEmail from "../emails/forgot-password.js";
import welcomeEmail from "../emails/welcome.js";
import passwordChangeEmail from "../emails/password-change.js";

const User = express.Router();
const userDao = new UserDao();
const moduleDao = new ModuleDao();

const hidePassword = (user) => {
  const { password, __v, ...userWithoutPassword } = user._doc;
  return userWithoutPassword;
};

User.get("/", checkResearcherPermission, async (req, res, next) => {
  try {
    const users = await userDao.findAllUsers();
    res.json({
      status: 200,
      message: "Users retrieved",
      data: users.map((user) => hidePassword(user)),
    });
  } catch (err) {
    next(err);
  }
});

User.get("/:id/", checkUserPermission, async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await userDao.findUserById(id);
    res.json({
      status: 200,
      message: "User retrieved",
      data: hidePassword(user),
    });
  } catch (err) {
    next(err);
  }
});

User.post("/:id/verify-license/", async (req, res, next) => {
  try {
    // TODO add validation for driving license id (not None and number)
    const participantId = req.params.id;
    const drivingLicenseId = req.body.drivingLicenseId;
    const user = await userDao.findUserById(participantId);
    if (comparePassword(drivingLicenseId, user.drivingLicenseId)) {
      res.json({
        status: 200,
        message: "License verified",
        data: hidePassword(user),
      });
    } else {
      throw new ApiError(400, "License not verified", "drivingLicenseId");
    }
  } catch (err) {
    next(err);
  }
});

User.post("/current-user/", async (req, res, next) => {
  try {
    const email = verifyToken(req.cookies.token).email;
    const userInfo = await userDao.findActiveUserByEmail(email);
    res.json({
      status: 200,
      message: "Current user retrieved",
      data: hidePassword(userInfo),
    });
  } catch (err) {
    next(err);
  }
});

User.get("/:id/modules/", checkUserPermission, async (req, res, next) => {
  try {
    const participantId = req.params.id;
    const filter = req.query.filter;
    const modules = await userDao.getModules(participantId, filter);
    res.json({
      status: 200,
      message: "Modules retrieved",
      data: modules,
    });
  } catch (err) {
    next(err);
  }
});

User.get(
  "/:id/modules/:moduleId/scenarios/",
  checkUserPermission,
  async (req, res, next) => {
    try {
      const participantId = req.params.id;
      const moduleId = req.params.moduleId;
      const filter = req.query.filter;
      const scenarios = await userDao.getScenarios(
        participantId,
        moduleId,
        filter
      );
      res.json({
        status: 200,
        message: "Scenarios retrieved",
        data: scenarios,
      });
    } catch (err) {
      next(err);
    }
  }
);

User.get(
  "/:id/modules/:moduleId/scenarios/:scenarioId/",
  checkUserPermission,
  async (req, res, next) => {
    try {
      const participantId = req.params.id;
      const moduleId = req.params.moduleId;
      const scenarioId = req.params.scenarioId;
      const filter = req.query.filter;
      const activities = await userDao.getActivities(
        participantId,
        moduleId,
        scenarioId,
        filter
      );
      res.json({
        status: 200,
        message: "Activities retrieved",
        data: activities,
      });
    } catch (err) {
      next(err);
    }
  }
);

User.get(
  "/:id/modules/:moduleId/scenarios/:scenarioId/activities/:activityId/",
  checkUserPermission,
  async (req, res, next) => {
    try {
      const participantId = req.params.id;
      const moduleId = req.params.moduleId;
      const scenarioId = req.params.scenarioId;
      const activityId = req.params.activityId;
      const activity = await userDao.getActivity(
        participantId,
        moduleId,
        scenarioId,
        activityId
      );
      res.json({
        status: 200,
        message: "Activity retrieved",
        data: activity,
      });
    } catch (err) {
      next(err);
    }
  }
);

User.get(
  "/:id/current-activity/",
  checkUserPermission,
  async (req, res, next) => {
    try {
      const participantId = req.params.id;
      const current = await userDao.getCurrentActivity(participantId);
      res.json({
        status: 200,
        message: "Current activity retrieved",
        data: current,
      });
    } catch (err) {
      next(err);
    }
  }
);

User.get("/:id/modules/:moduleId/status/", async (req, res, next) => {
  try {
    const id = req.params.id;
    const moduleId = req.params.moduleId;
    const status = await userDao.getModuleStatus(id, moduleId);
    res.json({
      status: 200,
      message: "Module status retrieved",
      data: status,
    });
  } catch (err) {
    next(err);
  }
});

User.post("/login", async (req, res, next) => {
  try {
    const userAgent = req.get("User-Agent");
    const email = req.body.email;
    const password = req.body.password;
    const user = await userDao.checkPassword(email, password, userAgent);
    const token = createToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // set to true if your using https
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    res.json({
      status: 200,
      message: "Login successful!",
      data: hidePassword(user),
    });
  } catch (err) {
    next(err);
  }
});

User.post("/reset-password/url", async (req, res, next) => {
  try {
    const email = req.body.email;
    const link = await userDao.createUrl(email);
    await sendEmail(
      email,
      "Hazard Perception | Reset Password",
      null,
      forgotPasswordEmail(email, link)
    );
    res.json({
      status: 200,
      message: "Password reset email has been sent",
    });
  } catch (err) {
    next(err);
  }
});

User.post("/reset-password/verify-url", async (req, res, next) => {
  try {
    const participantId = req.body.participantId;
    const user = await userDao.findUserById(participantId);
    const currentTime = new Date();
    const expirationTime = new Date(
      user.dateResetPwUrlCreated.getTime() + 10 * 60 * 1000
    );
    if (currentTime <= expirationTime) {
      res.json({
        status: 200,
        message: "Reset password url verified",
        data: user.email,
      });
    } else {
      throw new ApiError(
        400,
        "Reset password url not verified",
        "participantId"
      );
    }
  } catch (err) {
    next(err);
  }
});

User.post("/reset-password/forgot-reset", async (req, res, next) => {
  try {
    const { email, password, confirmPassword } = req.body;
    const user = await userDao.findActiveUserByEmail(email);
    const currentTime = new Date();
    const expirationTime = new Date(
      user.dateResetPwUrlCreated.getTime() + 10 * 60 * 1000
    );
    if (currentTime > expirationTime)
      throw new ApiError(401, "Unauthorized access!");

    await userDao.updatePassword(email, password, confirmPassword);
    await sendEmail(
      email,
      "Hazard Perception | Reset Password",
      null,
      passwordChangeEmail(email)
    );
    res.json({
      status: 200,
      message: "Password reset successful!",
      data: email,
    });
  } catch (err) {
    next(err);
  }
});

User.post("/reset-password/profile-reset", async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword, confirmNewPassword } = req.body;
    await userDao.checkOldPassword(email, oldPassword);
    await userDao.updatePassword(email, newPassword, confirmNewPassword);
    await sendEmail(
      email,
      "Hazard Perception | Reset Password",
      null,
      passwordChangeEmail(email)
    );
    res.json({
      status: 200,
      message: "Password reset successful!",
      data: email,
    });
  } catch (err) {
    next(err);
  }
});

User.post("/register/", async (req, res, next) => {
  try {
    const userAgent = req.get("User-Agent");
    const updatedUser = await userDao.activateUser(req.body, userAgent);
    const token = createToken(updatedUser);
    const email = updatedUser.email;
    await sendEmail(
      email,
      "Hazard Perception | Welcome",
      null,
      welcomeEmail(email)
    );
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // set to true if your using https
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    res.json({
      status: 200,
      message: "user successfully activated",
      data: hidePassword(updatedUser),
    });
  } catch (err) {
    next(err);
  }
});

User.put("/:id/add-module/", checkUserPermission, async (req, res, next) => {
  try {
    const participantId = req.params.id;
    const updatedUser = await userDao.addUserModule(participantId, req.body);
    res.json({
      status: 200,
      message: "module added",
      data: hidePassword(updatedUser),
    });
  } catch (err) {
    next(err);
  }
});

User.post("/upload/", checkResearcherPermission, async (req, res, next) => {
  try {
    const jsonData = req.body.data;

    let count = 0;
    for (const record of jsonData) {
      count++;
      // check for required fields:
      // participant id, email, contact, firstName, lastName, drivingLicenseId
      if (!record.email) {
        throw new ApiError(
          400,
          `Required field is missing in record ${count}`,
          "email"
        );
      }
      if (!record.firstName) {
        throw new ApiError(
          400,
          `Required field is missing in record ${count}`,
          "firstName"
        );
      }
      if (!record.lastName) {
        throw new ApiError(
          400,
          `Required field is missing in record ${count}`,
          "lastName"
        );
      }
      if (!record.participantId) {
        throw new ApiError(
          400,
          `Required field is missing in record ${count}`,
          "participantId"
        );
      }
      if (!record.drivingLicenseId) {
        throw new ApiError(
          400,
          `Required field is missing in record ${count}`,
          "drivingLicenseId"
        );
        // check for email and participant exists
      }
      const user = await userDao.findByEmailAndparticipantId(
        record.email,
        record.participantId.toString()
      );
      if (user) {
        throw new ApiError(
          400,
          `User with email exists in record ${count}`,
          "email"
        );
      }
    }
    count = 0;
    for (const record of jsonData) {
      // create user
      const hashedLicenseId = hashPassword(record.drivingLicenseId);
      record.drivingLicenseId = hashedLicenseId;
      await userDao.createUser(record);
      // encrypt license id
      count++;
    }
    res.json({
      status: 200,
      message: `${count} users successfully registered`,
      data: null,
    });
  } catch (err) {
    next(err);
  }
});

User.put("/:id/update-module/", checkUserPermission, async (req, res, next) => {
  try {
    const participantId = req.params.id;
    const updatedUser = await userDao.updateUserModule(participantId, req.body);
    res.json({
      status: 200,
      message: "module updated",
      data: hidePassword(updatedUser),
    });
  } catch (err) {
    next(err);
  }
});

User.post("/logout/", async (req, res, next) => {
  try {
    if (req.cookies.token) {
      res.clearCookie("token");
    }
    res.json({
      status: 200,
      message: "Logout successful!",
    });
  } catch (err) {
    next(err);
  }
});

User.put(
  ":id/modules/:moduleId/complete-module/",
  checkUserPermission,
  async (req, res, next) => {
    try {
      const participantId = req.params.id;
      const moduleId = req.params.moduleId;
      const updatedUser = await userDao.completeUserModule(
        participantId,
        moduleId
      );
      res.json({
        status: 200,
        message: "module completed",
        data: hidePassword(updatedUser),
      });
    } catch (err) {
      next(err);
    }
  }
);

User.put(
  "/:id/modules/:moduleId/scenarios/:scenarioId/complete-scenario/",
  checkUserPermission,
  async (req, res, next) => {
    try {
      const participantId = req.params.id;
      const moduleId = req.params.moduleId;
      const scenarioId = req.params.scenarioId;
      const updatedUser = await userDao.completeUserScenario(
        participantId,
        moduleId,
        scenarioId
      );
      res.json({
        status: 200,
        message: "scenario completed",
        data: hidePassword(updatedUser),
      });
    } catch (err) {
      next(err);
    }
  }
);

User.put(
  "/:id/modules/:moduleId/scenarios/:scenarioId/activities/:activityId/complete-activity/",
  checkUserPermission,
  async (req, res, next) => {
    try {
      const participantId = req.params.id;
      const moduleId = req.params.moduleId;
      const scenarioId = req.params.scenarioId;
      const activityId = req.params.activityId;
      const lastCorrectIndex = req.body.lastCorrectIndex;
      const updatedUser = await userDao.completeUserActivity(
        participantId,
        moduleId,
        scenarioId,
        activityId,
        lastCorrectIndex
      );
      res.json({
        status: 200,
        message: "activity completed",
        data: hidePassword(updatedUser),
      });
    } catch (err) {
      next(err);
    }
  }
);

User.put(
  "/:id/modules/:moduleId/scenarios/:scenarioId/activities/:activityId/add-answer/",
  checkUserPermission,
  async (req, res, next) => {
    try {
      const participantId = req.params.id;
      const moduleId = req.params.moduleId;
      const scenarioId = req.params.scenarioId;
      const activityId = req.params.activityId;
      const { coordinates, timeStarted, timeEnded } = req.body;
      const updatedUser = await userDao.addCoordinatesToActivity(
        participantId,
        moduleId,
        scenarioId,
        activityId,
        coordinates,
        timeStarted,
        timeEnded
      );
      res.json({
        status: 200,
        message: "answer added",
        data: updatedUser.modules.get(moduleId).scenarios.get(scenarioId),
      });
    } catch (err) {
      next(err);
    }
  }
);

User.delete("/:id/", async (req, res, next) => {
  try {
    const participantId = req.params.id;
    const deletedUser = await userDao.deleteUser(participantId);
    res.json({
      status: 200,
      message: "user deleted",
      data: hidePassword(deletedUser),
    });
  } catch (err) {
    next(err);
  }
});

export default User;
