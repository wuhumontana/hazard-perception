import User from "../model/User.js";
import ModuleDao from "./ModuleDao.js";
import ApiError from "../model/ApiError.js";
import {
  validateEmail,
  checkForPasswordMatch,
  checkForPasswordValidation,
} from "../util/validators.js";
import { checkForCorrectness } from "../util/coordinates.js";
import { comparePassword, hashPassword } from "../util/password.js";
import { decryptWithPrivateKey } from "../util/encrypt.js";
import sendEmail from "../util/nodemailer.js";
import newDeviceLoginEmail from "../emails/new-device-login.js";
import moment from "moment";
import fs from "fs";

class UserDao {
  async findByEmail(email) {
    if (!validateEmail(email)) {
      throw new ApiError(400, "Please input the correct email!", "email");
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new ApiError(404, "Email not found", "email");
    }
    return user;
  }

  async findByEmailAndparticipantId(email, participantId) {
    if (!validateEmail(email)) {
      throw new ApiError(400, "Please input the correct email!", "email");
    }
    const user = await User.findOne({
      email: email,
      participantId: participantId,
    });
    return user;
  }

  async findActiveUserByEmail(email) {
    if (!validateEmail(email)) {
      throw new ApiError(400, "Please input the correct email!", "email");
    }
    const user = await User.findOne({ email: email, isActivated: true });
    if (!user) {
      throw new ApiError(404, "active user not found", "email");
    }
    return user;
  }

  async findActiveUserById(participantId) {
    // TODO: add validation for participantId
    const user = await User.findOne({
      participantId: participantId,
      isActivated: true,
    });
    if (!user) {
      throw new ApiError(404, "active user not found", "participantId");
    }
    return user;
  }

  async findUserById(participantId) {
    // TODO: add validation for participantId
    const user = await User.findOne({
      participantId: participantId,
    });
    if (!user) {
      throw new ApiError(
        404,
        "user with participant id not found",
        "participantId"
      );
    }
    return user;
  }

  async findAllUsers() {
    const users = await User.find();
    return users;
  }

  async checkPassword(email, password, userAgent) {
    const decryptedPassword = decryptWithPrivateKey(password);
    const user = await this.findActiveUserByEmail(email);
    const compareValue = comparePassword(decryptedPassword, user.password);

    if (!compareValue) {
      throw new ApiError(400, "Please input the correct password!", "password");
    }

    //const isExist = user.devices.some(device => device.deviceInfo === userAgent);
    const existingDevice = user.devices.find(
      (device) => device.deviceInfo === userAgent
    );
    const requestTime = moment().format("YYYY-MM-DD HH:mm:ss");
    // User login in a new device
    if (existingDevice) {
      // Add request time to the existed device
      existingDevice.requestTimes.push(requestTime);
    } else {
      // send email notification
      await sendEmail(
        user.email,
        "Hazard Perception | New Device Login",
        "",
        newDeviceLoginEmail(user.email, requestTime, userAgent)
      );
      // Add new device infomation
      user.devices.push({ deviceInfo: userAgent, requestTimes: [requestTime] });
    }
    await user.save();
    return user;
  }

  async checkOldPassword(email, password) {
    const decryptedPassword = decryptWithPrivateKey(password);
    const user = await this.findActiveUserByEmail(email);
    const compareValue = comparePassword(decryptedPassword, user.password);
    if (!compareValue) {
      throw new ApiError(
        400,
        "Please input the correct old password!",
        "oldPassword"
      );
    }
    return user;
  }

  async findInactiveUserByEmail(email) {
    if (!validateEmail(email)) {
      throw new ApiError(400, "Please input the correct email!", "email");
    }
    const user = await User.findOne({ email: email, isActivated: false });
    if (!user) {
      throw new ApiError(404, "inactive user not found", "email");
    }
    return user;
  }

  async readModule() {
    const data = await fs.readFileSync("scenarios_json/module1_response.json");
    const module_obj = JSON.parse(data);
    return module_obj;
  }
  
  async activateUser(props, userAgent) {
    const {
      participantId,
      email,
      firstName,
      lastName,
      drivingLicenseId,
      dateJoined,
    } = props;
    let { password, confirmPassword } = props;
    password = decryptWithPrivateKey(password);
    confirmPassword = decryptWithPrivateKey(confirmPassword);
    //     check for required fields
    if (
      !participantId ||
      !email ||
      !password ||
      !confirmPassword ||
      !firstName ||
      !lastName ||
      !drivingLicenseId
    ) {
      throw new ApiError(400, "Required Field Missing", null);
    }
    let user = await this.findByEmail(email);
    // compare participant ID
    if (participantId !== user.participantId) {
      throw new ApiError(404, "Participant ID does not match", "participantId");
    }
    if (!user.drivingLicenseId) {
      throw new ApiError(400, "License ID not found", "drivingLicenseId");
    }
    //     compare licenseID
    const compareValue = comparePassword(
      drivingLicenseId,
      user.drivingLicenseId
    );
    if (!compareValue) {
      throw new ApiError(404, "License ID does not match", "drivingLicenseId");
    }
    //     check if user exists in active state
    if (user.isActivated) {
      throw new ApiError(400, "email registered", "email");
    }
    if (!checkForPasswordMatch(password, confirmPassword)) {
      throw new ApiError(400, "Passwords do not match", "confirmPassword");
    }
    if (!checkForPasswordValidation(password)) {
      throw new ApiError(400, "Password does not match criteria", "password");
    }
    const hashedPassword = hashPassword(password);
    const filter = { email: email, isActivated: false };
    const moduleMap = await this.readModule();
    const update = {
      password: hashedPassword,
      isActivated: true,
      dateJoined: dateJoined,
      userResponse: moduleMap,
      devices: [
        {
          deviceInfo: userAgent,
          requestTimes: [moment().format("YYYY-MM-DD HH:mm:ss")],
        },
      ],
    };
    user = await User.findOneAndUpdate(filter, update, { new: true });
    return user;
  }

  async updatePassword(email, password, confirmPassword) {
    const decryptedPassword = decryptWithPrivateKey(password);
    const decryptedConfirmPassword = decryptWithPrivateKey(confirmPassword);
    if (!checkForPasswordMatch(decryptedPassword, decryptedConfirmPassword)) {
      throw new ApiError(400, "Passwords do not match", "confirmNewPassword");
    }
    if (!checkForPasswordValidation(decryptedPassword)) {
      throw new ApiError(
        400,
        "Password does not match criteria",
        "newPassword"
      );
    }
    const user = await this.findActiveUserByEmail(email);
    const compareValue = comparePassword(decryptedPassword, user.password);
    if (compareValue) {
      throw new ApiError(400, "Please input a new password!", "newPassword");
    }
    const hashedPassword = hashPassword(decryptedPassword);
    user.password = hashedPassword;
    user.dateResetPwUrlCreated = new Date(0);
    await user.save();
    return user;
  }

  async createUser(user) {
    const newUser = new User(user);
    await newUser.save();
    return newUser;
  }

  async createUrl(email) {
    const user = await this.findActiveUserByEmail(email);
    user.dateResetPwUrlCreated = new Date();
    await user.save();
    const participantIdStr = JSON.stringify({
      participantId: user.participantId,
    });
    const participantIdBase64 =
      Buffer.from(participantIdStr).toString("base64");
    const link =
      "http://localhost:5173/reset-password?token=" + participantIdBase64;
    return link;
  }

  async getModules(id, filter) {
    const user = await this.findActiveUserById(id);
    const modules = user.modules;
    if (filter === "isCompleted") {
      return modules.filter((module) => module.isCompleted);
    } else if (filter === "isStarted") {
      return modules.filter((module) => module.isStarted);
    }
    return modules;
  }

  async getModuleStatus(id, moduleId) {
    const user = await this.findActiveUserById(id);
    const module = user.modules.get(moduleId);
    if (!module) {
      throw new ApiError(404, "module not found", "moduleId");
    }
    const data = [];
    module.scenarios.forEach((scenario) => {
      scenario.activities.forEach((activity) => {
        if (!activity.isCompleted) {
          data.push("incomplete");
        } else {
          if (
            activity.lastCorrectIndex ===
            activity.hitboxCoordinatesResponses.length - 1
          ) {
            data.push("correct");
          } else {
            data.push("incorrect");
          }
        }
      });
    });
    return data;
  }

  async getScenarios(id, moduleId, filter) {
    const user = await this.findActiveUserById(id);
    const scenarios = user.modules.get(moduleId).scenarios;
    if (filter === "isCompleted") {
      return scenarios.filter((scenario) => scenario.isCompleted);
    } else if (filter === "isStarted") {
      return scenarios.filter((scenario) => scenario.isStarted);
    }
    return scenarios;
  }

  async getActivities(id, moduleId, scenarioId, filter) {
    const user = await this.findActiveUserById(id);
    const activities = user.modules.get(moduleId).scenarios.get(scenarioId);
    if (filter === "isCompleted") {
      return activities.filter((activity) => activity.isCompleted);
    }
    return activities;
  }

  async getActivity(id, moduleId, scenarioId, activityId) {
    const user = await this.findActiveUserById(id);
    const module = user.modules.get(moduleId);
    if (!module) {
      throw new ApiError(404, "Module not found", "module");
    }
    const scenario = user.modules.get(moduleId).scenarios.get(scenarioId);
    if (!scenario) {
      throw new ApiError(404, "Scenario not found", "scenario");
    }
    const activity = scenario.activities.get(activityId);
    if (!activity) {
      throw new ApiError(404, "Activity not found", "activity");
    }
    return activity;
  }

  async getCurrentActivity(id) {
    const user = await this.findActiveUserById(id);
    const modules = user.modules;
    const modulesArray = Array.from(modules.values());
    const incompleteModules = modulesArray.filter(
      (module) => !module.isCompleted
    );
    if (incompleteModules.length === 0) {
      return {
        moduleId: "module_1",
        scenarioId: "intersections_1",
        activityId: "S",
        isCompleted: true,
      };
    }
    const startedModules = incompleteModules.filter(
      (module) => module.isStarted
    );
    if (startedModules.length === 0) {
      return {
        moduleId: incompleteModules[0].id,
        scenarioId: "intersections_1",
        activityId: "S",
        isCompleted: false,
      };
    }
    const startedModule = startedModules[startedModules.length - 1];
    const incompleteScenariosArray = Array.from(
      startedModule.scenarios.values()
    );
    const incompleteScenarios = incompleteScenariosArray.filter(
      (scenario) => !scenario.isCompleted
    );
    if (incompleteScenarios.length === 0) {
      throw new ApiError(404, "No incomplete scenarios found", "scenario");
    }
    const startedScenariosArray = Array.from(startedModule.scenarios.values());
    const startedScenarios = startedScenariosArray.filter(
      (scenario) => scenario.isStarted
    );
    if (startedScenarios.length === 0) {
      throw new ApiError(404, "No started scenarios found", "scenario");
    }
    const startedScenario = startedScenarios[startedScenarios.length - 1];
    const incompleteActivitiesArray = Array.from(
      startedScenario.activities.values()
    );
    const incompleteActivities = incompleteActivitiesArray.filter(
      (activity) => !activity.isCompleted
    );
    if (incompleteActivities.length === 0) {
      throw new ApiError(404, "No incomplete activities found", "activity");
    }
    const current = incompleteActivities[0];
    return {
      moduleId: startedModule.id,
      scenarioId: startedScenario.id,
      activityId: current.id,
      isCompleted: false,
    };
  }

  async addUserModule(id, module) {
    const user = await this.findActiveUserById(id);
    if (user.modules.get(module.id)) {
      throw new ApiError(409, "Module already exists", "module");
    }
    user.modules.set(module.id, module);
    await user.save();
    return user;
  }

  async updateUserModule(id, module) {
    const user = await this.findActiveUserById(id);
    if (!user.modules.get(module.id)) {
      throw new ApiError(404, "Module not found", "module");
    }
    user.modules.set(module.id, module);
    await user.save();
    return user;
  }

  async completeUserModule(id, moduleId) {
    const user = await this.findActiveUserById(id);
    const module = user.modules.get(moduleId);
    if (!module) {
      throw new ApiError(404, "Module not found", "module");
    }
    module.isCompleted = true;
    await user.save();
    return user;
  }

  async completeUserScenario(id, moduleId, scenarioId) {
    const user = await this.findActiveUserById(id);
    const module = user.modules.get(moduleId);
    if (!module) {
      throw new ApiError(404, "Module not found", "module");
    }
    const scenario = module.scenarios.get(scenarioId);
    if (!scenario) {
      throw new ApiError(404, "Scenario not found", "scenario");
    }
    scenario.isCompleted = true;
    await user.save();
    return user;
  }

  async completeUserActivity(id, moduleId, scenarioId, activityId, lastIndex) {
    const user = await this.findActiveUserById(id);
    const module = user.modules.get(moduleId);
    if (!module) {
      throw new ApiError(404, "Module not found", "module");
    }
    const scenario = module.scenarios.get(scenarioId);
    if (!scenario) {
      throw new ApiError(404, "Scenario not found", "scenario");
    }
    const activity = scenario.activities.get(activityId);
    if (!activity) {
      throw new ApiError(404, "Activity not found", "activity");
    }
    activity.isCompleted = true;
    activity.lastCorrectIndex = lastIndex;
    await user.save();
    return user;
  }

  async addCoordinatesToActivity(
    id,
    moduleId,
    scenarioId,
    activityId,
    coordinates,
    timeStarted,
    timeEnded
  ) {
    const user = await this.findActiveUserById(id);
    const module = user.modules.get(moduleId);
    if (!module) {
      throw new ApiError(404, "Module not found", "module");
    }
    module.isStarted = true;
    const scenario = module.scenarios.get(scenarioId);
    if (!scenario) {
      throw new ApiError(404, "Scenario not found", "scenario");
    }
    scenario.isStarted = true;
    const activity = scenario.activities.get(activityId);
    if (!activity) {
      throw new ApiError(404, "Activity not found", "activity");
    }
    const lastIndex = activity.responseStartTimes.length;
    activity.responseStartTimes.push(timeStarted);
    activity.responseEndTimes.push(timeEnded);
    activity.hitboxCoordinatesResponses.push(coordinates);
    const correctCoordinates = activity.hitboxCoordinates;
    const correctRadii = activity.hitboxRadii;
    if (checkForCorrectness(coordinates, correctCoordinates, correctRadii)) {
      activity.isCompleted = true;
      activity.lastCorrectIndex = lastIndex;
      if (activityId === "T") {
        await this.completeUserScenario(id, moduleId, scenarioId);
        const scenarioNum = scenarioId.split("_")[1];
        if (parseInt(scenarioNum) === 6) {
          await this.completeUserModule(id, moduleId);
        }
      }
    }
    await user.save();
    return user;
  }

  async deleteUser(id) {
    const user = await User.findOneAndDelete({ participantId: id });
    if (!user) {
      throw new ApiError(404, "User not found", "user");
    }
    return user;
  }
}

export default UserDao;
