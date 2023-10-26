import { describe, expect, it } from "vitest";
import {
  validateActivityId,
  validateEmail,
  validateModule,
  validateModuleId,
  validateModuleType,
  validateScenarioId,
  checkForPasswordMatch,
  checkForPasswordValidation,
  validateType,
  validateContent,
  validateEntrance,
} from "../../src/util/validators";
import { faker } from "@faker-js/faker";

describe("Test validateEmail", () => {
  it("should return true for valid email", () => {
    expect(validateEmail("test@example.com")).toBe(true);
  });
  it("should return false for invalid email", () => {
    expect(validateEmail("test")).toBe(false);
  });
  it("should return false for empty email", () => {
    expect(validateEmail("")).toBe(false);
  });
  it("should return false for null email", () => {
    expect(validateEmail(null)).toBe(false);
  });
});

describe("Test checkForPasswordMatch", () => {
  it("should return true for matching passwords", () => {
    expect(checkForPasswordMatch("password", "password")).toBe(true);
  });
  it("should return false for non-matching passwords", () => {
    expect(checkForPasswordMatch("password", "password1")).toBe(false);
  });
  it("should return false for empty passwords", () => {
    expect(checkForPasswordMatch("", "")).toBe(false);
  });
  it("should return false for null passwords", () => {
    expect(checkForPasswordMatch(null, null)).toBe(false);
  });
});

/* TODO: Add tests for checkForPasswordValidation */
describe("Test checkForPasswordValidation", () => {
  it("should return true for valid password", () => {
    expect(checkForPasswordValidation("password")).toBe(true);
  });
  it("should return false for invalid password", () => {
    expect(checkForPasswordValidation("pass")).toBe(false);
  });
  it("should return false for empty password", () => {
    expect(checkForPasswordValidation("")).toBe(false);
  });
  it("should return false for null password", () => {
    expect(checkForPasswordValidation(null)).toBe(false);
  });
});

describe("Test validateModuleId", () => {
  it("should return true for valid module id", () => {
    expect(validateModuleId("intersection_1")).toBe(true);
  });
  it("should return false for invalid module id", () => {
    expect(validateModuleId("test")).toBe(false);
  });
  it("should return false for empty module id", () => {
    expect(validateModuleId("")).toBe(false);
  });
  it("should return false for null module id", () => {
    expect(validateModuleId(null)).toBe(false);
  });
  it("should return false for invalid module id", () => {
    expect(validateModuleId("intersection_0")).toBe(false);
  });
});

describe("Test validateModuleType", () => {
  it("should return true for valid module type", () => {
    expect(validateModuleType("HA")).toBe(true);
  });
  it("should return false for invalid module type", () => {
    expect(validateModuleType("test")).toBe(false);
  });
  it("should return false for empty module type", () => {
    expect(validateModuleType("")).toBe(false);
  });
  it("should return false for null module type", () => {
    expect(validateModuleType(null)).toBe(false);
  });
});

describe("Test validateScenarioId", () => {
  it("should return true for valid scenario id", () => {
    expect(validateScenarioId("scenario_1")).toBe(true);
  });
  it("should return false for invalid scenario id", () => {
    expect(validateScenarioId("test")).toBe(false);
  });
  it("should return false for empty scenario id", () => {
    expect(validateScenarioId("")).toBe(false);
  });
  it("should return false for null scenario id", () => {
    expect(validateScenarioId(null)).toBe(false);
  });
  it("should return false for invalid scenario id", () => {
    expect(validateScenarioId("scenario_0")).toBe(false);
  });
});

describe("Test validateActivityId", () => {
  it("should return true for valid activity id", () => {
    expect(validateActivityId("S")).toBe(true);
  });
  it("should return false for invalid activity id", () => {
    expect(validateActivityId("test")).toBe(false);
  });
  it("should return false for empty activity id", () => {
    expect(validateActivityId("")).toBe(false);
  });
  it("should return false for null activity id", () => {
    expect(validateActivityId(null)).toBe(false);
  });
});

describe("Test validateModule", () => {
  it("should return true for valid module", () => {
    expect(validateModule({ id: "intersection_1", type: "HA" })).toBe(true);
  });
  it("should return false for invalid module", () => {
    expect(validateModule({ id: "test", type: "HA" })).toBe(false);
  });
  it("should return false for empty module", () => {
    expect(validateModule({ id: "", type: "HA" })).toBe(false);
  });
  it("should return false for null module", () => {
    expect(validateModule({ id: null, type: "HA" })).toBe(false);
  });
  it("should return false for invalid module", () => {
    expect(validateModule({ id: "intersection_0", type: "HA" })).toBe(false);
  });
  it("should return false for invalid module", () => {
    expect(validateModule({ id: "intersection_1", type: "test" })).toBe(false);
  });
  it("should return false for invalid module", () => {
    expect(validateModule({ id: "intersection_1", type: "" })).toBe(false);
  });
  it("should return false for invalid module", () => {
    expect(validateModule({ id: "intersection_1", type: null })).toBe(false);
  });
  it("should return false for invalid module", () => {
    expect(validateModule({ id: null, type: null })).toBe(false);
  });
  it("should return false for empty module", () => {
    expect(validateModule({})).toBe(false);
  });
  it("should return false for null module", () => {
    expect(validateModule(null)).toBe(false);
  });
});

describe("Test validateType", () => {
  it("should return true for valid type", () => {
    expect(validateType("Bug Report")).toBe(true);
  });
  it("should return true for valid type", () => {
    expect(validateType("Suggestion")).toBe(true);
  });
  it("should return true for valid type", () => {
    expect(validateType("Support")).toBe(true);
  });
  it("should return true for valid type", () => {
    expect(validateType("Other")).toBe(true);
  });
  it("should return false for invalid type", () => {
    expect(validateType(" Other")).toBe(false);
  });
  it("should return false for invalid type", () => {
    expect(validateType("")).toBe(false);
  });
  it("should return false for null type", () => {
    expect(validateType(null)).toBe(false);
  });
  it("should return false for empty type", () => {
    expect(validateType()).toBe(false);
  });
});

describe("Test validateContent", () => {
  it("should return true for valid content of length 10", () => {
    expect(validateContent(faker.string.alpha(10))).toBe(true);
  });
  it("should return true for valid content of length 1000", () => {
    expect(validateContent(faker.string.alpha(1000))).toBe(true);
  });
  it("should return false for invalid content of lenth 1", () => {
    expect(validateContent(faker.string.alpha(1))).toBe(false);
  });
  it("should return false for invalid content of length 1001", () => {
    expect(validateContent(faker.string.alpha(1001))).toBe(false);
  });
  it("should return false for invalid content of length 0", () => {
    expect(validateContent("")).toBe(false);
  });
  it("should return false for null content", () => {
    expect(validateContent(null)).toBe(false);
  });
  it("should return false for empty content", () => {
    expect(validateContent()).toBe(false);
  });
});

describe("Test validateEntrance", () => {
  it("should return true for valid entrance", () => {
    expect(validateEntrance("profile")).toBe(true);
  });
  it("should return true for valid entrance", () => {
    expect(
      validateEntrance("Module 1 > Intersections 1 • Strategic Activity")
    ).toBe(true);
  });
  it("should return false for invalid entrance of length 61", () => {
    expect(validateEntrance(faker.string.alpha(61))).toBe(false);
  });
  it("should return false for invalid entrance of length 0", () => {
    expect(validateEntrance("")).toBe(false);
  });
  it("should return false for null entrance", () => {
    expect(validateEntrance(null)).toBe(false);
  });
  it("should return false for empty entrance", () => {
    expect(validateEntrance()).toBe(false);
  });
});
