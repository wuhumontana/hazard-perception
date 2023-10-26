import ApiError from "../model/ApiError.js";
import Module from "../model/Module.js";
import {
  validateModuleId,
  validateScenarioId,
  validateActivityId,
  validateModule,
} from "../util/validators.js";

class ModuleDao {
  async findAll() {
    const modules = await Module.find();
    return modules;
  }

  async findByModuleId(moduleId) {
    if (!validateModuleId(moduleId)) {
      throw new ApiError(400, `Module id ${moduleId} is not valid`);
    }
    const module = await Module.findOne({ id: moduleId });
    if (!module) {
      throw new ApiError(404, `Module with id ${moduleId} not found`);
    }
    return module;
  }

  async findByModuleType(type) {
    const modules = await Module.find({ type: type });
    if (!modules) {
      throw new ApiError(404, `No module with type ${type} was found`);
    }
    return modules;
  }

  async findByScenarioId(moduleId, scenarioId) {
    if (!validateModuleId(moduleId)) {
      throw new ApiError(400, `Module id ${moduleId} is not valid`);
    }
    if (!validateScenarioId(scenarioId)) {
      throw new ApiError(400, `Scenario id ${scenarioId} is not valid`);
    }
    const module = await Module.findOne({ id: moduleId });
    if (!module) {
      throw new ApiError(404, `No module with id ${moduleId} was found`);
    }
    const scenario = module.scenarios.get(scenarioId);
    if (!scenario) {
      throw new ApiError(404, `No scenario with id ${scenarioId} was found`);
    }
    return scenario;
  }

  async findByActivityId(moduleId, scenarioId, activityId) {
    if (!validateModuleId(moduleId)) {
      throw new ApiError(400, `Module id ${moduleId} is not valid`);
    }
    if (!validateScenarioId(scenarioId)) {
      throw new ApiError(400, `Scenario id ${scenarioId} is not valid`);
    }
    if (!validateActivityId(activityId)) {
      throw new ApiError(400, `Activity id ${activityId} is not valid`);
    }
    const modules = await Module.findOne({ id: moduleId });
    if (!modules) {
      throw new ApiError(
        404,
        `No module with scenario id ${scenarioId} was found`
      );
    }
    const scenario = modules.scenarios.get(scenarioId);
    if (!scenario) {
      throw new ApiError(404, `No scenario with id ${scenarioId} was found`);
    }
    const activity = scenario.activities.get(activityId);
    if (!activity) {
      throw new ApiError(404, `No activity with id ${activityId} was found`);
    }
    return activity;
  }

  async findByMaintenanceActivityId(
    moduleId,
    scenarioId,
    maintenanceActivityId
  ) {
    if (!validateModuleId(moduleId)) {
      throw new ApiError(400, `Module id ${moduleId} is not valid`);
    }
    if (!validateScenarioId(scenarioId)) {
      throw new ApiError(400, `Scenario id ${scenarioId} is not valid`);
    }
    if (!validateActivityId(maintenanceActivityId)) {
      throw new ApiError(
        400,
        `Activity id ${maintenanceActivityId} is not valid`
      );
    }
    const modules = await Module.findOne({ id: moduleId });
    if (!modules) {
      throw new ApiError(
        404,
        `No module with scenario id ${scenarioId} was found`
      );
    }
    const scenario = modules.scenarios.get(scenarioId);
    if (!scenario) {
      throw new ApiError(404, `No scenario with id ${scenarioId} was found`);
    }
    const maintenanceActivity = scenario.maintenanceActivities.get(
      maintenanceActivityId
    );
    if (!maintenanceActivity) {
      throw new ApiError(
        404,
        `No activity with id ${maintenanceActivityId} was found`
      );
    }
    return maintenanceActivity;
  }

  async create(module) {
    if (!validateModule(module)) {
      throw new ApiError(400, `Module is not valid`);
    }
    const existingModule = await Module.findOne({ id: module.id });
    if (existingModule) {
      throw new ApiError(409, `Module with id ${module.id} already exists`);
    }
    const newModule = new Module(module);
    await newModule.save();
    return newModule;
  }

  async addScenario(moduleId, scenario) {
    if (!validateModuleId(moduleId)) {
      throw new ApiError(400, `Module id ${moduleId} is not valid`);
    }
    if (!validateScenarioId(scenario.id)) {
      throw new ApiError(400, `Scenario id ${scenario.id} is not valid`);
    }
    const module = await Module.findOne({ id: moduleId });
    if (!module) {
      throw new ApiError(404, `Module with id ${moduleId} not found`);
    }
    module.scenarios.set(scenario.id, scenario);
    await module.save();
    return module;
  }

  async addActivity(moduleId, scenarioId, activity) {
    if (!validateModuleId(moduleId)) {
      throw new ApiError(400, `Module id ${moduleId} is not valid`);
    }
    if (!validateScenarioId(scenarioId)) {
      throw new ApiError(400, `Scenario id ${scenarioId} is not valid`);
    }
    if (!validateActivityId(activity.id)) {
      throw new ApiError(400, `Activity id ${activity.id} is not valid`);
    }
    const module = await Module.findOne({ id: moduleId });
    if (!module) {
      throw new ApiError(404, `Module with id ${moduleId} not found`);
    }
    const scenario = module.scenarios.get(scenarioId);
    if (!scenario) {
      throw new ApiError(404, `Scenario with id ${moduleId} not found`);
    }
    scenario.activities.set(activity.id, activity);
    await module.save();
    return scenario;
  }

  async addMaintenanceActivity(moduleId, scenarioId, maintenanceActivity) {
    if (!validateModuleId(moduleId)) {
      throw new ApiError(400, `Module id ${moduleId} is not valid`);
    }
    if (!validateScenarioId(scenarioId)) {
      throw new ApiError(400, `Scenario id ${scenarioId} is not valid`);
    }
    if (!validateActivityId(maintenanceActivity.id)) {
      throw new ApiError(
        400,
        `Activity id ${maintenanceActivity.id} is not valid`
      );
    }
    const module = await Module.findOne({ id: moduleId });
    if (!module) {
      throw new ApiError(404, `Module with id ${moduleId} not found`);
    }
    const scenario = module.scenarios.get(scenarioId);
    if (!scenario) {
      throw new ApiError(404, `Scenario with id ${moduleId} not found`);
    }
    scenario.maintenanceActivities.set(
      maintenanceActivity.id,
      maintenanceActivity
    );
    await module.save();
    return scenario;
  }

  async update(moduleId, module) {
    if (!validateModuleId(moduleId)) {
      throw new ApiError(400, `Module id ${moduleId} is not valid`);
    }
    if (!validateModule(module)) {
      throw new ApiError(400, `Module is not valid`);
    }
    const updatedModule = await Module.findOneAndUpdate(
      { id: moduleId },
      module,
      { new: true }
    );
    if (!updatedModule) {
      throw new ApiError(404, `Module with id ${module.id} not found`);
    }
    return updatedModule;
  }

  async updateScenario(moduleId, scenarioId, scenario) {
    if (!validateModuleId(id)) {
      throw new ApiError(400, `Module id ${moduleId} is not valid`);
    }
    if (!validateScenarioId(scenarioId)) {
      throw new ApiError(400, `Scenario id ${scenarioId} is not valid`);
    }
    if (!validateScenarioId(scenario.id)) {
      throw new ApiError(400, `Scenario id ${scenario.id} is not valid`);
    }
    const module = await Module.findOne({ id: moduleId });
    if (!module) {
      throw new ApiError(404, `Module with id ${moduleId} not found`);
    }
    if (!module.scenarios.get(scenarioId)) {
      throw new ApiError(404, `Scenario with id ${scenarioId} not found`);
    }
    module.scenarios.set(scenario.id, scenario);
    await module.save();
    return module;
  }

  async updateActivity(moduleId, scenarioId, activity) {
    if (!validateModuleId(moduleId)) {
      throw new ApiError(400, `Module id ${moduleId} is not valid`);
    }
    if (!validateScenarioId(scenarioId)) {
      throw new ApiError(400, `Scenario id ${scenarioId} is not valid`);
    }
    if (!validateActivityId(activity.id)) {
      throw new ApiError(400, `Activity id ${activity.id} is not valid`);
    }
    const module = await Module.findOne({ id: moduleId });
    if (!module) {
      throw new ApiError(404, `Module with id ${moduleId} not found`);
    }
    const scenario = module.scenarios.get(scenarioId);
    if (!scenario) {
      throw new ApiError(404, `Scenario with id ${scenarioId} not found`);
    }
    if (!scenario.activities.get(activity.id)) {
      throw new ApiError(
        404,
        `Activity with id ${maintenanceActivity.id} not found`
      );
    }
    scenario.activities.set(activity.id, activity);
    await module.save();
    return scenario;
  }

  async updateMaintenanceActivity(moduleId, scenarioId, maintenanceActivity) {
    if (!validateModuleId(moduleId)) {
      throw new ApiError(400, `Module id ${moduleId} is not valid`);
    }
    if (!validateScenarioId(scenarioId)) {
      throw new ApiError(400, `Scenario id ${scenarioId} is not valid`);
    }
    if (!validateActivityId(maintenanceActivity.id)) {
      throw new ApiError(
        400,
        `Activity id ${maintenanceActivity.id} is not valid`
      );
    }
    const module = await Module.findOne({ id: moduleId });
    if (!module) {
      throw new ApiError(404, `Module with id ${moduleId} not found`);
    }
    const scenario = module.scenarios.get(scenarioId);
    if (!scenario) {
      throw new ApiError(404, `Scenario with id ${scenarioId} not found`);
    }
    if (!scenario.maintenanceActivities.get(maintenanceActivity.id)) {
      throw new ApiError(
        404,
        `Activity with id ${maintenanceActivity.id} not found`
      );
    }
    scenario.maintenanceActivities.set(
      maintenanceActivity.id,
      maintenanceActivity
    );
    await module.save();
    return scenario;
  }

  async delete(moduleId) {
    if (!validateModuleId(moduleId)) {
      throw new ApiError(400, `Module id ${moduleId} is not valid`);
    }
    const module = await Module.findOneAndDelete({ id: moduleId });
    if (!module) {
      throw new ApiError(404, `Module with id ${moduleId} not found`);
    }
    return module;
  }

  async deleteScenario(moduleId, scenarioId) {
    if (!validateModuleId(moduleId)) {
      throw new ApiError(400, `Module id ${moduleId} is not valid`);
    }
    if (!validateScenarioId(scenarioId)) {
      throw new ApiError(400, `Scenario id ${scenarioId} is not valid`);
    }
    const module = await Module.findOne({ id: moduleId });
    if (!module) {
      throw new ApiError(404, `Module with id ${moduleId} not found`);
    }
    if (!module.scenarios.get(scenarioId)) {
      throw new ApiError(404, `Scenario with id ${scenarioId} not found`);
    }
    module.scenarios.delete(scenarioId);
    await module.save();
    return module;
  }

  async deleteActivity(moduleId, scenarioId, activityId) {
    if (!validateModuleId(moduleId)) {
      throw new ApiError(400, `Module id ${moduleId} is not valid`);
    }
    if (!validateScenarioId(scenarioId)) {
      throw new ApiError(400, `Scenario id ${scenarioId} is not valid`);
    }
    if (!validateActivityId(activityId)) {
      throw new ApiError(400, `Activity id ${activityId} is not valid`);
    }
    const module = await Module.findOne({ id: moduleId });
    if (!module) {
      throw new ApiError(404, `Module with id ${moduleId} not found`);
    }
    const scenario = module.scenarios.get(scenarioId);
    if (!scenario) {
      throw new ApiError(404, `Scenario with id ${scenarioId} not found`);
    }
    if (!scenario.activities.has(activityId)) {
      throw new ApiError(404, `Activity with id ${activityId} not found`);
    }
    scenario.activities.delete(activityId);
    await module.save();
    return scenario;
  }

  async deleteMaintenanceActivity(moduleId, scenarioId, maintenanceActivityId) {
    if (!validateModuleId(moduleId)) {
      throw new ApiError(400, `Module id ${moduleId} is not valid`);
    }
    if (!validateScenarioId(scenarioId)) {
      throw new ApiError(400, `Scenario id ${scenarioId} is not valid`);
    }
    if (!validateActivityId(maintenanceActivityId)) {
      throw new ApiError(
        400,
        `Activity id ${maintenanceActivityId} is not valid`
      );
    }
    const module = await Module.findOne({ id: moduleId });
    if (!module) {
      throw new ApiError(404, `Module with id ${moduleId} not found`);
    }
    const scenario = module.scenarios.get(scenarioId);
    if (!scenario) {
      throw new ApiError(404, `Scenario with id ${scenarioId} not found`);
    }
    if (!scenario.maintenanceActivities.has(maintenanceActivityId)) {
      throw new ApiError(
        404,
        `Activity with id ${maintenanceActivityId} not found`
      );
    }
    scenario.maintenanceActivities.delete(maintenanceActivityId);
    await module.save();
    return scenario;
  }
}

export default ModuleDao;
