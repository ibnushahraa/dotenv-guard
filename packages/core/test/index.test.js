const path = require('path');
const fs = require('fs');

describe('index.js exports and features', () => {
  let testDir;

  beforeEach(() => {
    testDir = path.join(__dirname, 'temp-' + Date.now());
    fs.mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);

    // Set master key for tests
    if (!process.env.DOTENV_GUARD_MASTER_KEY) {
      process.env.DOTENV_GUARD_MASTER_KEY = require('crypto').randomBytes(32).toString('hex');
    }
  });

  afterEach(() => {
    process.chdir(__dirname);
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('legacy getter', () => {
    test('should load legacy module or return null', () => {
      const index = require('../src/index.js');

      // Access legacy getter
      const legacy = index.legacy;

      // Either null (encryption.js failed to load) or an object (encryption.js loaded successfully)
      expect(legacy === null || typeof legacy === 'object').toBe(true);

      // If it loaded, it should have expected methods
      if (legacy !== null) {
        expect(typeof legacy.config).toBe('function');
      }
    });

    test('legacy getter can be called multiple times', () => {
      const index = require('../src/index.js');

      const legacy1 = index.legacy;
      const legacy2 = index.legacy;

      // Both calls should return the same result
      expect(legacy1).toBe(legacy2);
    });
  });

  describe('config with mode parameter', () => {
    test('should support mode parameter', () => {
      fs.writeFileSync('.env', 'BASE=1\n');
      fs.writeFileSync('.env.production', 'BASE=2\nPROD=1\n');

      const { config } = require('../src/index.js');
      config({ mode: 'production' });

      expect(process.env.BASE).toBe('2');
      expect(process.env.PROD).toBe('1');

      delete process.env.BASE;
      delete process.env.PROD;
    });

    test('should fallback to single file mode when mode not specified', () => {
      fs.writeFileSync('.env', 'SINGLE_FILE=true\n');

      const { config } = require('../src/index.js');
      config();

      expect(process.env.SINGLE_FILE).toBe('true');

      delete process.env.SINGLE_FILE;
    });
  });
});
