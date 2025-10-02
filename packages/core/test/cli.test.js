const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CLI_PATH = path.join(__dirname, "../src/cli/index.js");
const TMP_DIR = path.join(__dirname, "tmp-cli");
const ORIG_CWD = process.cwd();

let spyLog, spyErr;

beforeAll(() => {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

  // mute semua log biar tidak berisik di Jest
  spyLog = jest.spyOn(console, "log").mockImplementation(() => { });
  spyErr = jest.spyOn(console, "error").mockImplementation(() => { });
});

beforeEach(() => {
  // bersihkan file env/schema
  const schemaPath = path.join(TMP_DIR, "env.schema.json");
  if (fs.existsSync(schemaPath)) fs.unlinkSync(schemaPath);

  const envPath = path.join(TMP_DIR, ".env");
  if (fs.existsSync(envPath)) fs.unlinkSync(envPath);
});

afterAll(() => {
  process.chdir(ORIG_CWD);
  fs.rmSync(TMP_DIR, { recursive: true, force: true });

  // restore console
  spyLog.mockRestore();
  spyErr.mockRestore();
});

function runCLI(args) {
  return execSync(`node ${CLI_PATH} ${args}`, { cwd: TMP_DIR }).toString();
}

test("CLI version shows version", () => {
  const output = runCLI("-v");
  expect(output).toMatch(/dotenv-guard version/);
});

test("CLI init schema creates env.schema.json", () => {
  const envPath = path.join(TMP_DIR, ".env");
  fs.writeFileSync(envPath, "DB_HOST=localhost\n");

  const output = runCLI("init schema");
  expect(output).toMatch(/env.schema.json has been created/);

  const schemaPath = path.join(TMP_DIR, "env.schema.json");
  expect(fs.existsSync(schemaPath)).toBe(true);
});

test("CLI shows usage when no args", () => {
  const output = runCLI("");
  expect(output).toMatch(/Usage: npx dotenv-guard/);
});

test("CLI encrypt converts values to encrypted format", () => {
  const envPath = path.join(TMP_DIR, ".env");
  fs.writeFileSync(envPath, "DB_HOST=localhost\nDB_PORT=5432\n");

  const output = runCLI("encrypt");
  expect(output).toMatch(/\.env has been encrypted/);

  const content = fs.readFileSync(envPath, "utf8");
  expect(content).toMatch(/DB_HOST=.*:/); // encrypted format
  expect(content).toMatch(/DB_PORT=.*:/);
});

test("CLI decrypt restores plaintext values", () => {
  const envPath = path.join(TMP_DIR, ".env");
  fs.writeFileSync(envPath, "DB_HOST=localhost\nDB_PORT=5432\n");

  runCLI("encrypt"); // encrypt dulu

  const output = runCLI("decrypt"); // decrypt balik
  expect(output).toMatch(/\.env has been decrypted/);

  const content = fs.readFileSync(envPath, "utf8");
  expect(content).toMatch(/DB_HOST=localhost/);
  expect(content).toMatch(/DB_PORT=5432/);
});
