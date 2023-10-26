import { test, expect, describe } from "vitest";
import app from "../src/App.js";
import supertest from "supertest";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const request = new supertest(app);

describe("Test API / and non-existent endpoint", () => {
  test("Test API / endpoint", async () => {
    const response = await request.get("/");
    expect(response.status).toBe(200);
  });

  test("Test Non Existent Route", async () => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const response = await request
      .get("/non-existent-route")
      .set("Cookie", `token=${token}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Not Found");
  });
});
