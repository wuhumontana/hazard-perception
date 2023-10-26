import { describe, beforeAll, afterAll, expect, it } from "vitest";
import Scenario, { Activity, Coordinate } from "../../src/model/Scenario.js";
import dotenv from "dotenv";
import * as db from "../../src/data/db.js";
import { faker } from "@faker-js/faker";

dotenv.config();

const scenarioIdGenerator = () => {
  return `intersection_${Math.floor(Math.random() * 6) + 1}`;
};

const activityIdGenerator = () => {
  return Math.floor(Math.random()) == 0 ? "S" : "T";
};

describe("Test Scenario Schema and Model", () => {
  beforeAll(async () => {
    db.connect(process.env.DB_TEST_URI);
    await Scenario.deleteMany({});
  });
  describe("Test Coordinate Schema and Model", () => {
    it("should create a new coordinate", async () => {
      const x = Math.random();
      const y = Math.random();
      const coordinate = new Coordinate({
        x: x,
        y: y,
      });
      expect(coordinate.x).toBe(x);
      expect(coordinate.y).toBe(y);
    });
    it("should not create a coordinate without the x", async () => {
      const y = Math.random();
      const coordinate = new Coordinate({
        y: y,
      });
      await expect(coordinate.save()).rejects.toThrow();
    });
    it("should not create a coordinate without the y", async () => {
      const x = Math.random();
      const coordinate = new Coordinate({
        x: x,
      });
      await expect(coordinate.save()).rejects.toThrow();
    });
  });
  describe("Test Activity Schema and Model", () => {
    it("should create a new activity", async () => {
      const activity = new Activity({
        id: activityIdGenerator(),
        hitboxCoordinates: {
          x: Math.random(),
          y: Math.random(),
        },
        hitboxRadii: {
          x: Math.random(),
          y: Math.random(),
        },
      });
      expect(activity.id).toBe(activity.id);
      expect(activity.hitboxCoordinates.x).toBe(activity.hitboxCoordinates.x);
      expect(activity.hitboxCoordinates.y).toBe(activity.hitboxCoordinates.y);
      expect(activity.hitboxRadii.x).toBe(activity.hitboxRadii.x);
      expect(activity.hitboxRadii.y).toBe(activity.hitboxRadii.y);
    });
    it("should not create an activity without the id", async () => {
      const activity = new Activity({
        hitboxCoordinates: {
          x: Math.random(),
          y: Math.random(),
        },
        hitboxRadii: {
          x: Math.random(),
          y: Math.random(),
        },
      });
      await expect(activity.save()).rejects.toThrow();
    });
    it("should not create an activity without the hitboxCoordinates", async () => {
      const activity = new Activity({
        id: activityIdGenerator(),
        hitboxRadii: {
          x: Math.random(),
          y: Math.random(),
        },
      });
      await expect(activity.save()).rejects.toThrow();
    });
    it("should not create an activity without the hitboxRadii", async () => {
      const activity = new Activity({
        id: activityIdGenerator(),
        hitboxCoordinates: {
          x: Math.random(),
          y: Math.random(),
        },
      });
      await expect(activity.save()).rejects.toThrow();
    });
    it("should not create an activity with the wrong id", async () => {
      const activity = new Activity({
        id: "A",
        hitboxCoordinates: {
          x: Math.random(),
          y: Math.random(),
        },
        hitboxRadii: {
          x: Math.random(),
          y: Math.random(),
        },
      });
      await expect(activity.save()).rejects.toThrow();
    });
    it("should create an activity with response start and end times", async () => {
      const responseStartTime = faker.date.future();
      const responseEndTime = faker.date.future();
      const activity = new Activity({
        id: activityIdGenerator(),
        hitboxCoordinates: {
          x: Math.random(),
          y: Math.random(),
        },
        hitboxRadii: {
          x: Math.random(),
          y: Math.random(),
        },
        responseStartTimes: [responseStartTime],
        responseEndTimes: [responseEndTime],
      });
      expect(activity.id).toBe(activity.id);
      expect(activity.hitboxCoordinates.x).toBe(activity.hitboxCoordinates.x);
      expect(activity.hitboxCoordinates.y).toBe(activity.hitboxCoordinates.y);
      expect(activity.hitboxRadii.x).toBe(activity.hitboxRadii.x);
      expect(activity.hitboxRadii.y).toBe(activity.hitboxRadii.y);
      expect(activity.responseStartTimes[0]).toBe(responseStartTime);
      expect(activity.responseEndTimes[0]).toBe(responseEndTime);
    });
    it("should create an activity with response coordinates", async () => {
      const responseCoordinate = {
        x: Math.random(),
        y: Math.random(),
      };
      const responseRadii = {
        x: Math.random(),
        y: Math.random(),
      };
      const activity = new Activity({
        id: activityIdGenerator(),
        hitboxCoordinates: {
          x: Math.random(),
          y: Math.random(),
        },
        hitboxRadii: {
          x: Math.random(),
          y: Math.random(),
        },
        hitboxCoordinatesResponses: [responseCoordinate],
      });
      expect(activity.id).toBe(activity.id);
      expect(activity.hitboxCoordinates.x).toBe(activity.hitboxCoordinates.x);
      expect(activity.hitboxCoordinates.y).toBe(activity.hitboxCoordinates.y);
      expect(activity.hitboxRadii.x).toBe(activity.hitboxRadii.x);
      expect(activity.hitboxRadii.y).toBe(activity.hitboxRadii.y);
      expect(activity.hitboxCoordinatesResponses[0].x).toBe(
        responseCoordinate.x
      );
      expect(activity.hitboxCoordinatesResponses[0].y).toBe(
        responseCoordinate.y
      );
    });
  });
  describe("Test Scenario Schema and Model", () => {
    it("should create a new scenario", async () => {
      const xCoordinate = Math.random();
      const yCoordinate = Math.random();
      const xRadius = Math.random();
      const yRadius = Math.random();
      const scenarioId = scenarioIdGenerator();
      const activityId = activityIdGenerator();
      const scenario = new Scenario({
        id: scenarioId,
        activities: {
          [activityId]: {
            id: activityId,
            hitboxCoordinates: {
              x: xCoordinate,
              y: yCoordinate,
            },
            hitboxRadii: {
              x: xRadius,
              y: yRadius,
            },
          },
        },
      });
      expect(scenario.id).toBe(scenarioId);
      expect(scenario.activities.get(activityId).id).toBe(activityId);
      expect(scenario.activities.get(activityId).hitboxCoordinates.x).toBe(
        xCoordinate
      );
      expect(scenario.activities.get(activityId).hitboxCoordinates.y).toBe(
        yCoordinate
      );
      expect(scenario.activities.get(activityId).hitboxRadii.x).toBe(xRadius);
      expect(scenario.activities.get(activityId).hitboxRadii.y).toBe(yRadius);
    });
    it("should not create a scenario without the id", async () => {
      const scenario = new Scenario({
        activities: {},
      });
      await expect(scenario.save()).rejects.toThrow();
    });
    it("should default to an empty activities object", async () => {
      const scenario = new Scenario({
        id: scenarioIdGenerator(),
      });
      expect(scenario.id).toBe(scenario.id);
      expect(scenario.activities).toBeTypeOf("object");
      expect(scenario.activities).toMatchObject({});
    });
    it("should not create a scenario with the wrong id", async () => {
      const scenario = new Scenario({
        id: "A",
      });
      await expect(scenario.save()).rejects.toThrow();
    });
  });
  afterAll(async () => {
    await Scenario.deleteMany({});
    db.disconnect();
  });
});
