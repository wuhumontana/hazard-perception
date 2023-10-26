import { describe, expect, it } from "vitest";
import { hashPassword, comparePassword } from "../../src/util/password";
import ApiError from "../../src/model/ApiError";

describe("Test hashPassword", () => {
  it("should return a hashed password", () => {
    expect(hashPassword("password")).not.toBe("password");
    expect(hashPassword("password")).not.toBe(null);
    expect(hashPassword("password")).not.toBe(undefined);
    expect(hashPassword("password")).not.toBe("");
    expect(hashPassword("password")).toBeTypeOf("string");
  });
  it("should throw and error for for hashing a null password", () => {
    expect(() => hashPassword(null)).toThrow(ApiError);
  });
  it("should throw and error for for hashing an undefined password", () => {
    expect(() => hashPassword(undefined)).toThrow(ApiError);
  });
  it("should throw and error for for hashing an empty password", () => {
    expect(() => hashPassword("")).toThrow(ApiError);
  });
});

describe("Test comparePassword", () => {
  it("should return true for matching passwords", () => {
    expect(comparePassword("password", hashPassword("password"))).toBe(true);
  });
  it("should return false for non-matching passwords", () => {
    expect(comparePassword("password", hashPassword("password1"))).toBe(false);
  });
  it("should return false for empty passwords", () => {
    expect(comparePassword("", "")).toBe(false);
  });
  it("should return false for null passwords", () => {
    expect(comparePassword(null, null)).toBe(false);
  });
  it("should return false for undefined passwords", () => {
    expect(comparePassword(undefined, undefined)).toBe(false);
  });
});
