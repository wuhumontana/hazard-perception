import { expect, test } from "vitest";
import { faker } from "@faker-js/faker";
import ApiError from "../../src/model/ApiError.js";

test("test ApiError", () => {
  const message = faker.lorem.sentence();
  const status = faker.number.int();
  const data = {
    foo: faker.lorem.sentence(),
  };
  const apiError = new ApiError(status, message, data);
  expect(apiError.message).toBe(message);
  expect(apiError.status).toBe(status);
  expect(apiError.data).toBe(data);
  expect(apiError.name).toBe("Error");
});
