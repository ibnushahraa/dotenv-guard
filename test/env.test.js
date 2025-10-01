const fs = require("fs");

// mock keytar supaya tidak akses sistem
jest.mock("keytar", () => ({
  getPassword: jest.fn().mockResolvedValue("a".repeat(64)), // 32 byte hex
  setPassword: jest.fn().mockResolvedValue(true),
}));

const { encryptEnv, decryptEnv, loadEnv, config } = require("../src/index");

const TMP_ENV = "test.env";
const TMP_SCHEMA = "env.schema.json";

let spyExit;
let spyError;
let spyLog;

beforeEach(() => {
  if (fs.existsSync(TMP_ENV)) fs.unlinkSync(TMP_ENV);
  if (fs.existsSync(TMP_SCHEMA)) fs.unlinkSync(TMP_SCHEMA);

  // mock process.exit supaya Jest tidak keluar
  spyExit = jest.spyOn(process, "exit").mockImplementation((code) => {
    throw new Error("exit " + code);
  });

  // silent semua console supaya output test bersih
  spyError = jest.spyOn(console, "error").mockImplementation(() => { });
  spyLog = jest.spyOn(console, "log").mockImplementation(() => { });
});

afterEach(() => {
  if (fs.existsSync(TMP_ENV)) fs.unlinkSync(TMP_ENV);
  if (fs.existsSync(TMP_SCHEMA)) fs.unlinkSync(TMP_SCHEMA);
  spyExit.mockRestore();
  spyError.mockRestore();
  spyLog.mockRestore();
});

test("encryptEnv and decryptEnv work correctly", async () => {
  fs.writeFileSync(TMP_ENV, "HELLO=WORLD\nFOO=BAR\n");

  await encryptEnv(TMP_ENV);
  const encData = fs.readFileSync(TMP_ENV, "utf8");
  expect(encData).toMatch(/:/);

  const plain = await decryptEnv(TMP_ENV);
  expect(plain).toContain("HELLO=WORLD");
  expect(plain).toContain("FOO=BAR");
});

test("loadEnv decrypts and injects variables", async () => {
  fs.writeFileSync(TMP_ENV, "HELLO=WORLD\n");

  await loadEnv(TMP_ENV);

  expect(process.env.HELLO).toBe("WORLD");
});

test("config loads env and injects into process.env", async () => {
  fs.writeFileSync(TMP_ENV, "APP_NAME=DotenvGuard\n");

  await config({ path: TMP_ENV, enc: false });

  expect(process.env.APP_NAME).toBe("DotenvGuard");
});

test("config with validator passes if schema valid", async () => {
  fs.writeFileSync(TMP_ENV, "PORT=3000\n");
  fs.writeFileSync(
    TMP_SCHEMA,
    JSON.stringify({ PORT: { regex: "^[0-9]+$", required: true } }, null, 2)
  );

  await config({ path: TMP_ENV, enc: false, validator: true });
  expect(process.env.PORT).toBe("3000");
});

test("config with validator fails if schema invalid", async () => {
  fs.writeFileSync(TMP_ENV, "PORT=abc\n");
  fs.writeFileSync(
    TMP_SCHEMA,
    JSON.stringify({ PORT: { regex: "^[0-9]+$", required: true } }, null, 2)
  );

  await expect(
    config({ path: TMP_ENV, enc: false, validator: true })
  ).rejects.toThrow("exit 1");

  expect(spyExit).toHaveBeenCalledWith(1);
});

test("decryptEnv throws if .env file does not exist", async () => {
  await expect(decryptEnv("missing.env")).rejects.toThrow(/not found/);
});

test("config fails if .env file does not exist", async () => {
  await expect(config({ path: "missing.env", enc: false })).rejects.toThrow(
    "exit 1"
  );

  expect(spyExit).toHaveBeenCalledWith(1);
});

test("config warns if validator active but schema missing", async () => {
  fs.writeFileSync(TMP_ENV, "HELLO=WORLD\n");

  await config({ path: TMP_ENV, enc: false, validator: true });

  expect(spyError).toHaveBeenCalledWith(
    "⚠️ Validator enabled but schema file not found"
  );
});

test("config does not crash if default .env is missing and validator not used", async () => {
  await expect(config()).rejects.toThrow("exit 1");
  expect(spyExit).toHaveBeenCalledWith(1);
});
