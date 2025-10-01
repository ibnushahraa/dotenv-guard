const { templatesNode, templatesVite } = require("../src/cli/templates");

describe("templatesNode", () => {
  test("has required environments", () => {
    expect(templatesNode).toHaveProperty("development");
    expect(templatesNode).toHaveProperty("production");
    expect(templatesNode).toHaveProperty("test");
  });

  test("contains development env", () => {
    expect(templatesNode.development).toMatch(/APP_ENV=development/);
  });

  test("contains production env", () => {
    expect(templatesNode.production).toMatch(/APP_ENV=production/);
  });

  test("contains test env", () => {
    expect(templatesNode.test).toMatch(/APP_ENV=test/);
  });

  test("all templates use APP_ENV (non-vite)", () => {
    Object.values(templatesNode).forEach((tpl) => {
      expect(tpl).toMatch(/APP_ENV=/);
      expect(tpl).not.toMatch(/VITE_/);
    });
  });
});

describe("templatesVite", () => {
  test("has required environments", () => {
    expect(templatesVite).toHaveProperty("development");
    expect(templatesVite).toHaveProperty("production");
    expect(templatesVite).toHaveProperty("test");
  });

  test("contains development env with VITE_ prefix", () => {
    expect(templatesVite.development).toMatch(/VITE_APP_ENV=development/);
  });

  test("contains production env with VITE_ prefix", () => {
    expect(templatesVite.production).toMatch(/VITE_APP_ENV=production/);
  });

  test("contains test env with VITE_ prefix", () => {
    expect(templatesVite.test).toMatch(/VITE_APP_ENV=test/);
  });

  test("all templates use VITE_ prefix", () => {
    Object.values(templatesVite).forEach((tpl) => {
      expect(tpl).toMatch(/VITE_APP_ENV=/);
    });
  });
});
