export function checkForCorrectness(coordinates1, coordinates2, radii) {
  const isInsideEllipse =
    Math.pow((coordinates1.x - coordinates2.x) / radii.x, 2) +
    Math.pow((coordinates1.y - coordinates2.y) / radii.y, 2);
  return isInsideEllipse <= 1;
}
