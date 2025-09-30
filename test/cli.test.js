const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CLI_PATH = path.join(__dirname, "../src/cli/index.js");
const TMP_DIR = path.join(__dirname, "tmp-cli");
const ORIG_CWD = process.cwd();

beforeAll(() => {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);
});

beforeEach(() => {
  // hapus file env/schema kalau ada
  const schemaPath = path.join(TMP_DIR, "env.schema.json");
  if (fs.existsSync(schemaPath)) fs.unlinkSync(schemaPath);

  const envPath = path.join(TMP_DIR, ".env");
  if (fs.existsSync(envPath)) fs.unlinkSync(envPath);
});

afterAll(() => {
  process.chdir(ORIG_CWD);
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
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
