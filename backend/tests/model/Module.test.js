import { describe, beforeAll, afterAll, expect, it } from "vitest";
import Module from "../../src/model/Module.js";
import dotenv from "dotenv";
import * as db from "../../src/data/db.js";
import { faker } from "@faker-js/faker";

dotenv.config();

const moduleIdGenerator = () => {
  return `intersection_${Math.floor(Math.random() * 9) + 1}`;
};

const moduleTypeGenerator = () => {
  const types = ["HA", "HM", "AM"];
  return types[Math.floor(Math.random() * types.length)];
};

describe("Test Module Schema and Model", () => {
  beforeAll(async () => {
    db.connect(process.env.DB_TEST_URI);
    await Module.deleteMany({});
  });
  it("should create a new module", async () => {
    const module = new Module({
      id: moduleIdGenerator(),
      type: moduleTypeGenerator(),
    });
    const savedModule = await module.save();
    expect(savedModule.id).toBe(module.id);
    expect(savedModule.type).toBe(module.type);
    expect(savedModule.testing).toBe(false);
  });
  it("should create a new module with the testing", async () => {
    const module = new Module({
      id: moduleIdGenerator(),
      type: moduleTypeGenerator(),
      testing: true,
    });
    const savedModule = await module.save();
    expect(savedModule.id).toBe(module.id);
    expect(savedModule.type).toBe(module.type);
    expect(savedModule.testing).toBe(true);
  });
  it("should not create a module with the unique id", async () => {
    const module = new Module({
      id: moduleIdGenerator(),
      type: moduleTypeGenerator(),
    });
    await module.save();
    const module2 = new Module({
      id: module.id,
      type: moduleTypeGenerator(),
    });
    await expect(module2.save()).rejects.toThrow();
  });
  it("should not create a module without the id", async () => {
    const module = new Module({
      type: moduleTypeGenerator(),
    });
    await expect(module.save()).rejects.toThrow();
  });
  it("should not create a module without the type", async () => {
    const module = new Module({
      id: moduleIdGenerator(),
    });
    await expect(module.save()).rejects.toThrow();
  });
  it("should not create a module with the invalid type", async () => {
    const module = new Module({
      id: moduleIdGenerator(),
      type: "invalid",
    });
    await expect(module.save()).rejects.toThrow();
  });
  it("should not create a module with the invalid testing", async () => {
    const module = new Module({
      id: moduleIdGenerator(),
      type: moduleTypeGenerator(),
      testing: "invalid",
    });
    await expect(module.save()).rejects.toThrow();
  });
  it("should not create a module with the invalid isCompleted", async () => {
    const module = new Module({
      id: moduleIdGenerator(),
      type: moduleTypeGenerator(),
      isCompleted: "invalid",
    });
    await expect(module.save()).rejects.toThrow();
  });
  it("should not create a module with the invalid isStarted", async () => {
    const module = new Module({
      id: moduleIdGenerator(),
      type: moduleTypeGenerator(),
      isStarted: "invalid",
    });
    await expect(module.save()).rejects.toThrow();
  });
  afterAll(async () => {
    await Module.deleteMany({});
    db.disconnect();
  });
});
