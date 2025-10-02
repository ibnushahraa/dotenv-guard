const fs = require("fs");
const path = require("path");
const { getEnvFiles, getSchemaFile } = require("../src/multi-env");

const TEST_DIR = path.join(__dirname, "tmp-multienv");
const ORIG_CWD = process.cwd();

beforeEach(() => {
  // Create test directory
  if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR);
  process.chdir(TEST_DIR);

  // Clean up any existing test files
  const files = ['.env', '.env.local', '.env.development', '.env.development.local',
                 '.env.production', '.env.production.local', 'env.schema.json',
                 'env.schema.development.json'];
  files.forEach(file => {
    const filePath = path.join(TEST_DIR, file);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });
});

afterEach(() => {
  // Return to original directory first to avoid EBUSY on Windows
  process.chdir(ORIG_CWD);

  // Cleanup
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe("getEnvFiles", () => {
  test("returns only existing files in correct order", () => {
    fs.writeFileSync(path.join(TEST_DIR, '.env'), 'BASE=1');
    fs.writeFileSync(path.join(TEST_DIR, '.env.development'), 'DEV=1');

    const files = getEnvFiles('development');

    expect(files).toHaveLength(2);
    expect(files[0]).toContain('.env');
    expect(files[1]).toContain('.env.development');
  });

  test("includes .local files if they exist", () => {
    fs.writeFileSync(path.join(TEST_DIR, '.env'), 'BASE=1');
    fs.writeFileSync(path.join(TEST_DIR, '.env.local'), 'LOCAL=1');
    fs.writeFileSync(path.join(TEST_DIR, '.env.production'), 'PROD=1');
    fs.writeFileSync(path.join(TEST_DIR, '.env.production.local'), 'PROD_LOCAL=1');

    const files = getEnvFiles('production');

    expect(files).toHaveLength(4);
    expect(files[0]).toContain('.env');
    expect(files[1]).toContain('.env.local');
    expect(files[2]).toContain('.env.production');
    expect(files[3]).toContain('.env.production.local');
  });

  test("uses NODE_ENV if mode not specified", () => {
    process.env.NODE_ENV = 'test';
    fs.writeFileSync(path.join(TEST_DIR, '.env'), 'BASE=1');
    fs.writeFileSync(path.join(TEST_DIR, '.env.test'), 'TEST=1');

    const files = getEnvFiles();

    expect(files[1]).toContain('.env.test');
    delete process.env.NODE_ENV;
  });

  test("defaults to development if no mode and no NODE_ENV", () => {
    delete process.env.NODE_ENV;
    fs.writeFileSync(path.join(TEST_DIR, '.env'), 'BASE=1');
    fs.writeFileSync(path.join(TEST_DIR, '.env.development'), 'DEV=1');

    const files = getEnvFiles();

    expect(files[1]).toContain('.env.development');
  });

  test("returns empty array if no files exist", () => {
    const files = getEnvFiles('production');
    expect(files).toHaveLength(0);
  });
});

describe("getSchemaFile", () => {
  test("returns mode-specific schema if exists", () => {
    fs.writeFileSync(path.join(TEST_DIR, 'env.schema.development.json'), '{}');
    fs.writeFileSync(path.join(TEST_DIR, 'env.schema.json'), '{}');

    const schema = getSchemaFile('development');

    expect(schema).toContain('env.schema.development.json');
  });

  test("falls back to generic schema if mode-specific not found", () => {
    fs.writeFileSync(path.join(TEST_DIR, 'env.schema.json'), '{}');

    const schema = getSchemaFile('production');

    expect(schema).toContain('env.schema.json');
  });

  test("returns null if no schema files exist", () => {
    const schema = getSchemaFile('development');
    expect(schema).toBeNull();
  });

  test("uses NODE_ENV if mode not specified", () => {
    process.env.NODE_ENV = 'staging';
    fs.writeFileSync(path.join(TEST_DIR, 'env.schema.staging.json'), '{}');

    const schema = getSchemaFile();

    expect(schema).toContain('env.schema.staging.json');
    delete process.env.NODE_ENV;
  });
});
