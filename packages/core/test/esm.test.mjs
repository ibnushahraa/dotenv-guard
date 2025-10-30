import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { config, encryptValue, decryptValue, isEncrypted } from '../src/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ESM exports from index.mjs', () => {
  let testDir;
  let origCwd;

  beforeAll(() => {
    // Set master key for tests
    if (!process.env.DOTENV_GUARD_MASTER_KEY) {
      process.env.DOTENV_GUARD_MASTER_KEY = crypto.randomBytes(32).toString('hex');
    }
  });

  beforeEach(() => {
    origCwd = process.cwd();
    testDir = path.join(__dirname, 'temp-esm-' + Date.now());
    fs.mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(origCwd);
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }

    // Clean up env vars
    delete process.env.TEST_VAR;
    delete process.env.DB_HOST;
  });

  test('should export config function', () => {
    expect(typeof config).toBe('function');
  });

  test('config should load .env file', () => {
    fs.writeFileSync('.env', 'TEST_VAR=from_esm\n');

    config({ path: '.env' });

    expect(process.env.TEST_VAR).toBe('from_esm');
  });

  test('config should validate with validator option', () => {
    fs.writeFileSync('.env', 'DB_HOST=localhost\n');
    fs.writeFileSync('env.schema.json', JSON.stringify({
      DB_HOST: { required: true }
    }));

    config({ path: '.env', validator: true });

    expect(process.env.DB_HOST).toBe('localhost');
  });

  test('config should work without schema file when validator is true', () => {
    fs.writeFileSync('.env', 'DB_HOST=localhost\n');

    // No schema file exists, should not throw
    config({ path: '.env', validator: true });

    expect(process.env.DB_HOST).toBe('localhost');
  });

  test('config should throw on validation failure', () => {
    fs.writeFileSync('.env', 'DB_HOST=localhost\n');
    fs.writeFileSync('env.schema.json', JSON.stringify({
      DB_HOST: { required: true },
      REQUIRED_KEY: { required: true }
    }));

    expect(() => {
      config({ path: '.env', validator: true });
    }).toThrow('Environment validation failed');
  });

  test('encryptValue and decryptValue should work', () => {
    const plaintext = 'secret-value';
    const encrypted = encryptValue(plaintext);

    expect(isEncrypted(encrypted)).toBe(true);
    expect(decryptValue(encrypted)).toBe(plaintext);
  });
});
