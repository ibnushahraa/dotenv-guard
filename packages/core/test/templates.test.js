const { templatesNode, templatesVite } = require("../src/cli/templates");

describe("templatesNode", () => {
  test("has required environments", () => {
    expect(templatesNode).toHaveProperty("development");
    expect(templatesNode).toHaveProperty("production");
    expect(templatesNode).toHaveProperty("test");
  });

  test("contains development env with NODE_ENV", () => {
    expect(templatesNode.development).toMatch(/NODE_ENV=development/);
  });

  test("contains production env with NODE_ENV", () => {
    expect(templatesNode.production).toMatch(/NODE_ENV=production/);
  });

  test("contains test env with NODE_ENV", () => {
    expect(templatesNode.test).toMatch(/NODE_ENV=test/);
  });

  test("all templates have essential Node.js variables", () => {
    Object.values(templatesNode).forEach((tpl) => {
      expect(tpl).toMatch(/NODE_ENV=/);
      expect(tpl).toMatch(/APP_NAME=/);
      expect(tpl).toMatch(/APP_PORT=/);
      expect(tpl).toMatch(/DB_HOST=/);
      expect(tpl).not.toMatch(/VITE_/); // Node templates should not have VITE_ prefix
    });
  });

  test("includes modern features (JWT, LOG_LEVEL, CORS)", () => {
    expect(templatesNode.development).toMatch(/JWT_SECRET=/);
    expect(templatesNode.development).toMatch(/LOG_LEVEL=/);
    expect(templatesNode.development).toMatch(/CORS_ORIGIN=/);
  });
});

describe("templatesVite", () => {
  test("has required environments", () => {
    expect(templatesVite).toHaveProperty("development");
    expect(templatesVite).toHaveProperty("production");
    expect(templatesVite).toHaveProperty("test");
  });

  test("contains development env with NODE_ENV", () => {
    expect(templatesVite.development).toMatch(/NODE_ENV=development/);
  });

  test("contains production env with NODE_ENV", () => {
    expect(templatesVite.production).toMatch(/NODE_ENV=production/);
  });

  test("contains test env with NODE_ENV", () => {
    expect(templatesVite.test).toMatch(/NODE_ENV=test/);
  });

  test("public variables use VITE_ prefix", () => {
    Object.values(templatesVite).forEach((tpl) => {
      expect(tpl).toMatch(/VITE_APP_TITLE=/);
      expect(tpl).toMatch(/VITE_API_URL=/);
      expect(tpl).toMatch(/VITE_API_VERSION=/);
    });
  });

  test("backend secrets do NOT have VITE_ prefix", () => {
    Object.values(templatesVite).forEach((tpl) => {
      // These should exist without VITE_ prefix (not exposed to client)
      expect(tpl).toMatch(/^DB_HOST=/m);
      expect(tpl).toMatch(/^JWT_SECRET=/m);
      expect(tpl).toMatch(/^SESSION_SECRET=/m);

      // These should NOT exist with VITE_ prefix (security issue)
      expect(tpl).not.toMatch(/VITE_DB_HOST=/);
      expect(tpl).not.toMatch(/VITE_JWT_SECRET=/);
      expect(tpl).not.toMatch(/VITE_DB_PASSWORD=/);
    });
  });
});
