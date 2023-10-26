import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { UserRole } from "../model/UserRole.js";
import ApiError from "../model/ApiError.js";

// Create a limiter that allows a maximum of 100 login attempts per 15 minutes
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 login attempts per 15 minutes
  message: {
    status: 429,
    message: "Too many login attempts, please try again later.",
  },
  statusCode: 429, // Custom status code for rate limit exceeded
  headers: true, // Send rate limit headers with the response
});

// For generating token
export const createToken = function (user, expiresIn) {
  return jwt.sign(
    {
      email: user.email,
      password: user.password,
      participantId: user.participantId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: expiresIn || "24h",
    }
  );
};

export const verifyToken = function (token) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ["HS256"],
  });
};

export const checkToken = (req, res, next) => {
  try {
    const path = req.baseUrl + req.path;
    const acceptedPaths = [
      "/",
      "/users/login",
      "/users/register",
      "/users/reset-password/url",
      "/users/reset-password/verify-url",
      "/users/reset-password/forgot-reset",
      /^\/users\/\d+\/verify-license\/?$/,
    ];
    if (acceptedPaths.includes(path) || path.match(acceptedPaths[6])) {
      return next();
    }
    const token = req.cookies.token;

    if (!token) {
      throw new ApiError(401, "No token found, please login or register first");
    }
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return next(
        new ApiError(401, "Invalid token, please login or register first")
      );
    }
    next(err);
  }
};

export const checkRole = (userRole, role) => {
  if (userRole !== role) {
    return false;
  }
  return true;
};

export const checkUserPermission = (req, res, next) => {
  try {
    if (checkRole(req.user.role, UserRole.Researcher)) {
      return next();
    } else {
      if (req.user.participantId !== req.params.id) {
        throw new ApiError(401, "Unauthorized");
      }
      next();
    }
  } catch (err) {
    next(err);
  }
};

export const checkResearcherPermission = (req, res, next) => {
  try {
    const role = req.user.role;
    if (!checkRole(role, UserRole.Researcher)) {
      throw new ApiError(401, "Unauthorized");
    }
    return next();
  } catch (err) {
    next(err);
  }
};
