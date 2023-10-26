import { describe, expect, it } from "vitest";
import { checkForCorrectness } from "../../src/util/coordinates";

describe("Test checkForCorrectness", () => {
  it("should return true if the coordinates are inside the ellipse", () => {
    const coordinates1 = { x: 0, y: 0 };
    const coordinates2 = { x: 0, y: 0 };
    const radii = { x: 1, y: 1 };
    expect(checkForCorrectness(coordinates1, coordinates2, radii)).toBe(true);
  });
  it("should return true if the coordinates are on the ellipse", () => {
    const coordinates1 = { x: 0, y: 0 };
    const coordinates2 = { x: 1, y: 0 };
    const radii = { x: 1, y: 1 };
    expect(checkForCorrectness(coordinates1, coordinates2, radii)).toBe(true);
  });
  it("should return false if the coordinates are outside the ellipse", () => {
    const coordinates1 = { x: 0, y: 0 };
    const coordinates2 = { x: 2, y: 2 };
    const radii = { x: 1, y: 1 };
    expect(checkForCorrectness(coordinates1, coordinates2, radii)).toBe(false);
  });
  it("should return false if the coordinates are just outside the ellipse", () => {
    const coordinates1 = { x: 0, y: 0 };
    const coordinates2 = { x: 1.1, y: 0 };
    const radii = { x: 1, y: 1 };
    expect(checkForCorrectness(coordinates1, coordinates2, radii)).toBe(false);
  });
});
