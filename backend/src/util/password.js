import bcrypt from "bcryptjs";
import ApiError from "../model/ApiError.js";

const saltRounds = parseInt(process.env.SALT_ROUNDS);

export const hashPassword = (password) => {
  if (!password) {
    throw new ApiError(401, "Password is null");
  }
  return bcrypt.hashSync(password.toString(), saltRounds);
};

export const comparePassword = (password, hash) => {
  if (!password || !hash) {
    return false;
  }
  return bcrypt.compareSync(password, hash);
};
