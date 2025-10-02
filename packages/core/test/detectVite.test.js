const fs = require("fs");

// mock deasync supaya tidak butuh native binding
jest.mock("deasync", () => ({}));

jest.mock("fs");

const { detectVite } = require("../src/cli/index");

beforeEach(() => {
  jest.resetAllMocks();
});

test("detectVite returns true if vite.config.js exists", () => {
  fs.existsSync.mockImplementation((p) => p.includes("vite.config.js"));
  expect(detectVite()).toBe(true);
});

test("detectVite returns true if package.json has vite dependency", () => {
  fs.existsSync.mockImplementation((p) => p.includes("package.json"));
  fs.readFileSync = jest.fn().mockReturnValue(
    JSON.stringify({
      dependencies: { vite: "^4.0.0" },
    })
  );
  expect(detectVite()).toBe(true);
});

test("detectVite returns true if package.json has vite devDependency", () => {
  fs.existsSync.mockImplementation((p) => p.includes("package.json"));
  fs.readFileSync = jest.fn().mockReturnValue(
    JSON.stringify({
      devDependencies: { vite: "^4.0.0" },
    })
  );
  expect(detectVite()).toBe(true);
});

test("detectVite returns false if no vite files and no vite in package.json", () => {
  fs.existsSync.mockReturnValue(false);
  expect(detectVite()).toBe(false);
});
