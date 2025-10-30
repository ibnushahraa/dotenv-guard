const fs = require("fs");
const path = require("path");
const { config } = require("../src/index");

const TEST_DIR = path.join(__dirname, "tmp-config-mode");
const ORIG_CWD = process.cwd();

beforeEach(() => {
  // Create test directory
  if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR);
  process.chdir(TEST_DIR);

  // Clean up environment variables
  delete process.env.TEST_VAR;
  delete process.env.DB_HOST;
  delete process.env.API_KEY;
  delete process.env.NODE_ENV;
  delete process.env.DOTENV_GUARD_MODE;
  delete process.env.BASE;
  delete process.env.LOCAL;
  delete process.env.DEV;
  delete process.env.DEV_LOCAL;
  delete process.env.PROD;
  delete process.env.OVERRIDE;

  // Clean up any existing test files
  const files = ['.env', '.env.local', '.env.development', '.env.development.local',
                 '.env.production', '.env.production.local', 'env.schema.json'];
  files.forEach(file => {
    const filePath = path.join(TEST_DIR, file);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });
});

afterEach(() => {
  // Clean environment variables
  delete process.env.TEST_VAR;
  delete process.env.DB_HOST;
  delete process.env.API_KEY;
  delete process.env.NODE_ENV;
  delete process.env.DOTENV_GUARD_MODE;
  delete process.env.BASE;
  delete process.env.LOCAL;
  delete process.env.DEV;
  delete process.env.DEV_LOCAL;
  delete process.env.PROD;
  delete process.env.OVERRIDE;
  delete process.env.HOSTNAME;

  // Return to original directory first to avoid EBUSY on Windows
  process.chdir(ORIG_CWD);

  // Cleanup
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe("config() with mode parameter", () => {
  test("loads env file based on mode parameter", () => {
    fs.writeFileSync(path.join(TEST_DIR, '.env'), 'TEST_VAR=base');
    fs.writeFileSync(path.join(TEST_DIR, '.env.production'), 'TEST_VAR=production');

    config({ mode: 'production' });

    // .env.production should override .env
    expect(process.env.TEST_VAR).toBe('production');
  });

  test("loads multiple env files in correct priority order", () => {
    fs.writeFileSync(path.join(TEST_DIR, '.env'), 'BASE=1\nOVERRIDE=base');
    fs.writeFileSync(path.join(TEST_DIR, '.env.local'), 'LOCAL=1\nOVERRIDE=local');
    fs.writeFileSync(path.join(TEST_DIR, '.env.development'), 'DEV=1\nOVERRIDE=dev');
    fs.writeFileSync(path.join(TEST_DIR, '.env.development.local'), 'DEV_LOCAL=1\nOVERRIDE=dev-local');

    config({ mode: 'development' });

    expect(process.env.BASE).toBe('1');
    expect(process.env.LOCAL).toBe('1');
    expect(process.env.DEV).toBe('1');
    expect(process.env.DEV_LOCAL).toBe('1');
    // Later files should override earlier ones
    expect(process.env.OVERRIDE).toBe('dev-local');
  });

  test("works with DOTENV_GUARD_MODE environment variable", () => {
    fs.writeFileSync(path.join(TEST_DIR, '.env'), 'TEST_VAR=base');
    fs.writeFileSync(path.join(TEST_DIR, '.env.production'), 'TEST_VAR=production');

    // Simulate user setting DOTENV_GUARD_MODE
    process.env.DOTENV_GUARD_MODE = 'production';

    config({ mode: process.env.DOTENV_GUARD_MODE || 'development' });

    expect(process.env.TEST_VAR).toBe('production');
  });

  test("uses development as default when DOTENV_GUARD_MODE is not set", () => {
    fs.writeFileSync(path.join(TEST_DIR, '.env'), 'TEST_VAR=base');
    fs.writeFileSync(path.join(TEST_DIR, '.env.development'), 'TEST_VAR=development');

    config({ mode: process.env.DOTENV_GUARD_MODE || 'development' });

    expect(process.env.TEST_VAR).toBe('development');
  });

  test("loads only existing files when some are missing", () => {
    fs.writeFileSync(path.join(TEST_DIR, '.env'), 'BASE=1');
    fs.writeFileSync(path.join(TEST_DIR, '.env.production'), 'PROD=1');
    // .env.local and .env.production.local don't exist

    config({ mode: 'production' });

    expect(process.env.BASE).toBe('1');
    expect(process.env.PROD).toBe('1');
    expect(process.env.LOCAL).toBeUndefined();
  });

  test("works with validation when using mode parameter", () => {
    fs.writeFileSync(path.join(TEST_DIR, '.env.production'), 'DB_HOST=localhost\nAPI_KEY=secret123');
    fs.writeFileSync(path.join(TEST_DIR, 'env.schema.json'), JSON.stringify({
      "DB_HOST": { "required": true },
      "API_KEY": { "required": true }
    }));

    config({ mode: 'production', validator: true });

    expect(process.env.DB_HOST).toBe('localhost');
    expect(process.env.API_KEY).toBe('secret123');
  });

  test("throws validation error when required env is missing", () => {
    fs.writeFileSync(path.join(TEST_DIR, '.env.production'), 'DB_HOST=localhost');
    fs.writeFileSync(path.join(TEST_DIR, 'env.schema.json'), JSON.stringify({
      "DB_HOST": { "required": true },
      "API_KEY": { "required": true }
    }));

    expect(() => {
      config({ mode: 'production', validator: true });
    }).toThrow('Environment validation failed');
  });

  test("backward compatible with path parameter (single file mode)", () => {
    fs.writeFileSync(path.join(TEST_DIR, '.env'), 'TEST_VAR=single');

    config({ path: '.env' });

    expect(process.env.TEST_VAR).toBe('single');
  });

  test("mode parameter takes precedence over path parameter", () => {
    fs.writeFileSync(path.join(TEST_DIR, '.env'), 'TEST_VAR=base');
    fs.writeFileSync(path.join(TEST_DIR, '.env.production'), 'TEST_VAR=production');

    // When mode is specified, path is ignored
    config({ path: '.env', mode: 'production' });

    expect(process.env.TEST_VAR).toBe('production');
  });
});

describe("config() hostname-based mode selection pattern", () => {
  test("simulates hostname-based mode selection", () => {
    fs.writeFileSync(path.join(TEST_DIR, '.env'), 'TEST_VAR=base');
    fs.writeFileSync(path.join(TEST_DIR, '.env.production'), 'TEST_VAR=production');
    fs.writeFileSync(path.join(TEST_DIR, '.env.development'), 'TEST_VAR=development');

    // Simulate os.hostname() check
    const mockHostname = 'ubuntu';
    const mode = mockHostname === 'ubuntu' ? 'production' : 'development';

    config({ mode });

    expect(process.env.TEST_VAR).toBe('production');
  });

  test("simulates HOSTNAME env var based mode selection", () => {
    fs.writeFileSync(path.join(TEST_DIR, '.env'), 'TEST_VAR=base');
    fs.writeFileSync(path.join(TEST_DIR, '.env.production'), 'TEST_VAR=production');
    fs.writeFileSync(path.join(TEST_DIR, '.env.development'), 'TEST_VAR=development');

    // Simulate checking HOSTNAME environment variable
    process.env.HOSTNAME = 'ubuntu';
    const mode = process.env.HOSTNAME === 'ubuntu' ? 'production' : 'development';

    config({ mode });

    expect(process.env.TEST_VAR).toBe('production');
  });
});
