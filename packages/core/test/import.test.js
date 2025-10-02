const path = require("path");

// CJS require test
describe("dotenv-guard CJS require", () => {
    test("require gives access to functions", () => {
        const lib = require("../src/index.js");

        expect(lib).toHaveProperty("encryptEnv");
        expect(lib).toHaveProperty("decryptEnv");
        expect(lib).toHaveProperty("loadEnv");
        expect(lib).toHaveProperty("config");
    });
});

// ESM import test
describe("dotenv-guard ESM import", () => {
    test("import gives access to default export", async () => {
        const lib = await import(path.resolve(__dirname, "../src/index.mjs"));

        // default export
        expect(lib.default).toHaveProperty("config");
        expect(lib.default).toHaveProperty("encryptEnv");

        // named export
        expect(lib).toHaveProperty("config");
        expect(lib).toHaveProperty("encryptEnv");
    });
});
