const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { encryptValue, decryptValue, isEncrypted, encryptEnv, decryptEnv } = require('../src/cryptoEncryption');
const { generateMasterKey } = require('../src/keyManager');

describe('Crypto Encryption (AES-256-GCM with auto-key)', () => {
  let testDir;
  let testMasterKey;

  beforeAll(() => {
    // Generate test master key
    testMasterKey = generateMasterKey();
    // Set env var for testing (to avoid writing to user home)
    process.env.DOTENV_GUARD_MASTER_KEY = testMasterKey;
  });

  afterAll(() => {
    delete process.env.DOTENV_GUARD_MASTER_KEY;
  });

  beforeEach(() => {
    testDir = path.join(__dirname, 'temp-' + Date.now());
    fs.mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(__dirname);
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('encryptValue / decryptValue', () => {
    test('should encrypt and decrypt a simple string', () => {
      const plaintext = 'my-secret-value';
      const encrypted = encryptValue(plaintext);

      expect(encrypted).toContain('aes:');
      expect(encrypted).not.toContain(plaintext);

      const decrypted = decryptValue(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    test('should handle empty string', () => {
      const plaintext = '';
      const encrypted = encryptValue(plaintext);
      const decrypted = decryptValue(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    test('should handle special characters', () => {
      const plaintext = 'postgresql://user:p@ss!w0rd@localhost:5432/db?ssl=true';
      const encrypted = encryptValue(plaintext);
      const decrypted = decryptValue(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    test('should return plaintext if not encrypted', () => {
      const plaintext = 'not-encrypted';
      const decrypted = decryptValue(plaintext);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('isEncrypted', () => {
    test('should detect encrypted values', () => {
      const encrypted = encryptValue('secret');
      expect(isEncrypted(encrypted)).toBe(true);
    });

    test('should detect plaintext values', () => {
      expect(isEncrypted('plaintext')).toBe(false);
      expect(isEncrypted('')).toBeFalsy();
      expect(isEncrypted(null)).toBeFalsy();
    });
  });

  describe('encryptEnv / decryptEnv', () => {
    test('should encrypt .env file', () => {
      const envContent = 'DATABASE_URL=postgresql://localhost\nAPI_KEY=secret123\n';
      fs.writeFileSync('.env', envContent);

      encryptEnv('.env');

      const encrypted = fs.readFileSync('.env', 'utf8');
      expect(encrypted).toContain('aes:');
      expect(encrypted).not.toContain('postgresql://localhost');
      expect(encrypted).not.toContain('secret123');
    });

    test('should decrypt .env file', () => {
      const envContent = 'DATABASE_URL=postgresql://localhost\nAPI_KEY=secret123\n';
      fs.writeFileSync('.env', envContent);

      // Encrypt first
      encryptEnv('.env');

      // Then decrypt
      const decrypted = decryptEnv('.env');
      expect(decrypted).toContain('DATABASE_URL=postgresql://localhost');
      expect(decrypted).toContain('API_KEY=secret123');
    });

    test('should preserve comments and empty lines', () => {
      const envContent = '# Comment\nDATABASE_URL=postgresql://localhost\n\nAPI_KEY=secret123\n';
      fs.writeFileSync('.env', envContent);

      encryptEnv('.env');
      const decrypted = decryptEnv('.env');

      expect(decrypted).toContain('# Comment');
      const emptyLines = decrypted.split('\n').filter(l => l === '');
      expect(emptyLines.length).toBeGreaterThanOrEqual(1);
    });

    test('should skip already encrypted values', () => {
      const envContent = 'DATABASE_URL=postgresql://localhost\n';
      fs.writeFileSync('.env', envContent);

      // Encrypt once
      encryptEnv('.env');
      const firstEncrypt = fs.readFileSync('.env', 'utf8');

      // Encrypt again (should not change)
      encryptEnv('.env');
      const secondEncrypt = fs.readFileSync('.env', 'utf8');

      expect(firstEncrypt).toBe(secondEncrypt);
    });
  });
});
