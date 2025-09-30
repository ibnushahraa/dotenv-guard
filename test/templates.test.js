const { templatesNode, templatesVite } = require("../src/cli/templates");

describe("templatesNode", () => {
  test("contains development env", () => {
    expect(templatesNode).toHaveProperty("development");
    expect(templatesNode.development).toMatch(/APP_ENV=development/);
  });

  test("contains production env", () => {
    expect(templatesNode).toHaveProperty("production");
    expect(templatesNode.production).toMatch(/APP_ENV=production/);
  });

  test("contains test env", () => {
    expect(templatesNode).toHaveProperty("test");
    expect(templatesNode.test).toMatch(/APP_ENV=test/);
  });
});

describe("templatesVite", () => {
  test("contains development env with VITE_ prefix", () => {
    expect(templatesVite).toHaveProperty("development");
    expect(templatesVite.development).toMatch(/VITE_APP_ENV=development/);
  });

  test("contains production env with VITE_ prefix", () => {
    expect(templatesVite).toHaveProperty("production");
    expect(templatesVite.production).toMatch(/VITE_APP_ENV=production/);
  });

  test("contains test env with VITE_ prefix", () => {
    expect(templatesVite).toHaveProperty("test");
    expect(templatesVite.test).toMatch(/VITE_APP_ENV=test/);
  });
});
