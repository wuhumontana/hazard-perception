import { describe, expect, it, vi } from "vitest";
import { createToken, verifyToken, checkToken } from "../../src/util/token";
import dotenv from "dotenv";
import ApiError from "../../src/model/ApiError";

dotenv.config();

const user = {
  email: "test@example.com",
  password: "foobar",
  participantId: 1,
  role: "STUDENT",
};

describe("Test createToken", () => {
  it("should return a token", () => {
    const token = createToken(user, "1h");
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });
  it("should return a token of type jwt", () => {
    const token = createToken(user, "1h");
    expect(token.split(".").length).toBe(3);
  });
  it("should return a token with correct data", () => {
    const token = createToken(user, "1h");
    const decodedToken = verifyToken(token);
    expect(decodedToken.email).toBe(user.email);
    expect(decodedToken.participantId).toBe(user.participantId);
    expect(decodedToken.role).toBe(user.role);
  });
  it("should return a token with correct data type", () => {
    const token = createToken(user, "1h");
    const decodedToken = verifyToken(token);
    expect(typeof decodedToken.email).toBe("string");
    expect(typeof decodedToken.participantId).toBe("number");
    expect(typeof decodedToken.role).toBe("string");
  });
  it("should return a token with correct expiration time", () => {
    const token = createToken(user, "1h");
    const decodedToken = verifyToken(token);
    expect(decodedToken.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });
  it("should expire token after 24 hours if no expiration time is given", () => {
    const token = createToken(user);
    const decodedToken = verifyToken(token);
    expect(decodedToken.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    expect(decodedToken.exp).toBeLessThanOrEqual(
      Math.floor(Date.now() / 1000) + 24 * 60 * 60
    );
  });
  it("should expire token after expiration time", () => {
    const token = createToken(user, "1ms");
    setTimeout(() => {
      expect(() => verifyToken(token)).toThrow();
    }, 2);
  });
});

describe("Test verifyToken", () => {
  it("should return a decoded token", () => {
    const token = createToken(user, "1h");
    const decodedToken = verifyToken(token);
    expect(decodedToken).toHaveProperty("email");
    expect(decodedToken).toHaveProperty("participantId");
    expect(decodedToken).toHaveProperty("role");
  });
  it("should return a decoded token with correct data", () => {
    const token = createToken(user, "1h");
    const decodedToken = verifyToken(token);
    expect(decodedToken.email).toBe(user.email);
    expect(decodedToken.participantId).toBe(user.participantId);
    expect(decodedToken.role).toBe(user.role);
  });
  it("should return a decoded token with correct data type", () => {
    const token = createToken(user, "1h");
    const decodedToken = verifyToken(token);
    expect(typeof decodedToken.email).toBe("string");
    expect(typeof decodedToken.participantId).toBe("number");
    expect(typeof decodedToken.role).toBe("string");
  });
  it("should throw an error if token is invalid", () => {
    const token = "invalid token";
    expect(() => verifyToken(token)).toThrow();
  });
  it("should throw an error if token is expired", () => {
    const token = createToken(user, "1ms");
    setTimeout(() => {
      expect(() => verifyToken(token)).toThrow();
    }, 2);
  });
});

describe("Test checkToken", () => {
  it("should throw an error if no token is found", () => {
    const req = {
      baseUrl: "",
      path: "",
      cookies: {},
    };
    const res = {};
    const next = vi.fn();
    checkToken(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new ApiError(401, "No token found, please login or register first")
    );
  });
  it("should throw an error if token is invalid", () => {
    const req = {
      baseUrl: "",
      path: "",
      cookies: {
        token: "invalid token",
      },
    };
    const res = {};
    const next = vi.fn();
    checkToken(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new ApiError(401, "Invalid token, please login or register first")
    );
  });
  it("should throw an error if token is expired", () => {
    const req = {
      baseUrl: "",
      path: "",
      cookies: {
        token: createToken(user, "1ms"),
      },
    };
    const res = {};
    const next = vi.fn();
    setTimeout(() => {
      checkToken(req, res, next);
      expect(next).toHaveBeenCalledWith(
        new ApiError(401, "Invalid token, please login or register first")
      );
    }, 2);
  });
  it("should call next if token is valid", () => {
    const req = {
      baseUrl: "",
      path: "",
      cookies: {
        token: createToken(user, "1h"),
      },
    };
    const res = {};
    const next = vi.fn();
    checkToken(req, res, next);
    expect(next).toHaveBeenCalled();
  });
  it("should call next if token is not valid and path is /login", () => {
    const req = {
      baseUrl: "/users",
      path: "/login",
      cookies: {
        token: "invalid token",
      },
    };
    const res = {};
    const next = vi.fn();
    checkToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });
  it("should call next if token is not valid and path is /register", () => {
    const req = {
      baseUrl: "/users",
      path: "/register",
      cookies: {
        token: "invalid token",
      },
    };
    const res = {};
    const next = vi.fn();
    checkToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });
  it("should call next if token is not valid and path is /:id/verify-license", () => {
    const req = {
      baseUrl: "/users",
      path: "/1/verify-license",
      cookies: {
        token: "invalid token",
      },
    };
    const res = {};
    const next = vi.fn();
    checkToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });
  it("should call next with err if token is not valid and path is not accepted", () => {
    const req = {
      baseUrl: "/users",
      path: "/test",
      cookies: {
        token: "invalid token",
      },
    };
    const res = {};
    const next = vi.fn();
    checkToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      new ApiError(401, "Invalid token, please login or register first")
    );
  });
});
