import express from "express";
import ModuleDao from "../data/ModuleDao.js";

const Module = express.Router();
const moduleDao = new ModuleDao();

Module.get("/", async (req, res, next) => {
  try {
    console.log("insidee");
    const modules = await moduleDao.findAll();
    console.log("modules", modules);
    res.json({
      message: "Modules returned",
      status: 200,
      data: modules,
    });
  } catch (err) {
    next(err);
  }
});

Module.get("/:moduleId", async (req, res, next) => {
  try {
    const module = await moduleDao.findByModuleId(req.params.moduleId);
    res.json({
      message: "Module returned",
      status: 200,
      data: module,
    });
  } catch (err) {
    next(err);
  }
});

Module.get("/type/:type", async (req, res, next) => {
  try {
    const modules = await moduleDao.findByModuleType(req.params.type);
    res.json({
      message: "Modules returned",
      status: 200,
      data: modules,
    });
  } catch (err) {
    next(err);
  }
});

Module.get("/:moduleId/scenarios/:scenarioId", async (req, res, next) => {
  try {
    const scenario = await moduleDao.findByScenarioId(
      req.params.moduleId,
      req.params.scenarioId
    );
    res.json({
      message: "scenario returned",
      status: 200,
      data: scenario,
    });
  } catch (err) {
    next(err);
  }
});

Module.get(
  "/:moduleId/scenarios/:scenarioId/activities/:activityId",
  async (req, res, next) => {
    try {
      const activity = await moduleDao.findByActivityId(
        req.params.moduleId,
        req.params.scenarioId,
        req.params.activityId
      );
      res.json({
        message: "activity returned",
        status: 200,
        data: activity,
      });
    } catch (err) {
      next(err);
    }
  }
);

Module.get(
  "/:moduleId/scenarios/:scenarioId/maintenance-activities/:maintenanceActivityId",
  async (req, res, next) => {
    try {
      const maintenanceActivity = await moduleDao.findByMaintenanceActivityId(
        req.params.moduleId,
        req.params.scenarioId,
        req.params.maintenanceActivityId
      );
      res.json({
        message: "Attention Maintenance Activity returned",
        status: 200,
        data: maintenanceActivity,
      });
    } catch (err) {
      next(err);
    }
  }
);

Module.post("/", async (req, res, next) => {
  try {
    const module = await moduleDao.create(req.body);
    res.json({
      message: "Module created",
      status: 201,
      data: module,
    });
  } catch (err) {
    next(err);
  }
});

Module.put("/:moduleId/scenario", async (req, res, next) => {
  try {
    const module = await moduleDao.addScenario(req.params.moduleId, req.body);
    res.json({
      message: "Scenario added to module",
      status: 200,
      data: module,
    });
  } catch (err) {
    next(err);
  }
});

Module.put(
  "/:moduleId/scenarios/:scenarioId/activity",
  async (req, res, next) => {
    try {
      const scenario = await moduleDao.addActivity(
        req.params.moduleId,
        req.params.scenarioId,
        req.body
      );
      res.json({
        message: "Activity added to scenario",
        status: 200,
        data: scenario,
      });
    } catch (err) {
      next(err);
    }
  }
);

Module.put(
  "/:moduleId/scenarios/:scenarioId/maintenanceActivity",
  async (req, res, next) => {
    try {
      const scenario = await moduleDao.addMaintenanceActivity(
        req.params.moduleId,
        req.params.scenarioId,
        req.body
      );
      res.json({
        message: "Attention Maintenance Activity added to scenario",
        status: 200,
        data: scenario,
      });
    } catch (err) {
      next(err);
    }
  }
);

Module.patch("/:moduleId", async (req, res, next) => {
  try {
    const module = await moduleDao.update(req.params.moduleId, req.body);
    res.json({
      message: "Module updated",
      status: 200,
      data: module,
    });
  } catch (err) {
    next(err);
  }
});

Module.patch("/:moduleId/scenarios/:scenarioId", async (req, res, next) => {
  try {
    const module = await moduleDao.updateScenario(
      req.params.moduleId,
      req.params.scenarioId,
      req.body
    );
    res.json({
      message: "Scenario updated",
      status: 200,
      data: module,
    });
  } catch (err) {
    next(err);
  }
});

Module.patch(
  "/:moduleId/scenarios/:scenarioId/activities/:activityId",
  async (req, res, next) => {
    try {
      const scenario = await moduleDao.updateActivity(
        req.params.moduleId,
        req.params.scenarioId,
        req.body
      );
      res.json({
        message: "Activity updated",
        status: 200,
        data: scenario,
      });
    } catch (err) {
      next(err);
    }
  }
);

Module.patch(
  "/:moduleId/scenarios/:scenarioId/maintenance-activities/:maintenanceActivityId",
  async (req, res, next) => {
    try {
      const scenario = await moduleDao.updateMaintenanceActivity(
        req.params.moduleId,
        req.params.scenarioId,
        req.body
      );
      res.json({
        message: "Maintenance Activity updated",
        status: 200,
        data: scenario,
      });
    } catch (err) {
      next(err);
    }
  }
);

Module.delete("/:moduleId", async (req, res, next) => {
  try {
    const module = await moduleDao.delete(req.params.moduleId);
    res.json({
      message: "Module deleted",
      status: 200,
      data: module,
    });
  } catch (err) {
    next(err);
  }
});

Module.delete("/:moduleId/scenarios/:scenarioId", async (req, res, next) => {
  try {
    const module = await moduleDao.deleteScenario(
      req.params.moduleId,
      req.params.scenarioId
    );
    res.json({
      message: "Scenario deleted",
      status: 200,
      data: module,
    });
  } catch (err) {
    next(err);
  }
});

Module.delete(
  "/:moduleId/scenarios/:scenarioId/activities/:activityId",
  async (req, res, next) => {
    try {
      const scenario = await moduleDao.deleteActivity(
        req.params.moduleId,
        req.params.scenarioId,
        req.params.activityId
      );
      res.json({
        message: "Activity deleted",
        status: 200,
        data: scenario,
      });
    } catch (err) {
      next(err);
    }
  }
);

Module.delete(
  "/:moduleId/scenarios/:scenarioId/maintenance-activities/:maintenanceActivityId",
  async (req, res, next) => {
    try {
      const scenario = await moduleDao.deleteMaintenanceActivity(
        req.params.moduleId,
        req.params.scenarioId,
        req.params.maintenanceActivityId
      );
      res.json({
        message: "Attention Maintenance Activity deleted",
        status: 200,
        data: scenario,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default Module;
