const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { stripQuotes, encryptValue, decryptValue, isEncrypted, encryptEnv, decryptEnv, loadEnv } = require('../src/cryptoEncryption');
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

  describe('stripQuotes', () => {
    test('should strip double quotes', () => {
      expect(stripQuotes('"value"')).toBe('value');
      expect(stripQuotes('"Uwupay Next"')).toBe('Uwupay Next');
      expect(stripQuotes('"value with spaces"')).toBe('value with spaces');
    });

    test('should strip single quotes', () => {
      expect(stripQuotes("'value'")).toBe('value');
      expect(stripQuotes("'Uwupay Next'")).toBe('Uwupay Next');
      expect(stripQuotes("'value with spaces'")).toBe('value with spaces');
    });

    test('should not strip mismatched quotes', () => {
      expect(stripQuotes("'value\"")).toBe("'value\"");
      expect(stripQuotes("\"value'")).toBe("\"value'");
    });

    test('should not strip quotes in the middle', () => {
      expect(stripQuotes('some"value')).toBe('some"value');
      expect(stripQuotes("some'value")).toBe("some'value");
    });

    test('should handle values without quotes', () => {
      expect(stripQuotes('plainvalue')).toBe('plainvalue');
      expect(stripQuotes('value123')).toBe('value123');
    });

    test('should handle empty strings and null', () => {
      expect(stripQuotes('')).toBe('');
      expect(stripQuotes(null)).toBeNull();
      expect(stripQuotes(undefined)).toBeUndefined();
    });

    test('should handle single character', () => {
      expect(stripQuotes('a')).toBe('a');
      expect(stripQuotes('"')).toBe('"');
      expect(stripQuotes("'")).toBe("'");
    });

    test('should handle nested quotes', () => {
      expect(stripQuotes('"value with \'inner\' quotes"')).toBe("value with 'inner' quotes");
      expect(stripQuotes("'value with \"inner\" quotes'")).toBe('value with "inner" quotes');
    });

    test('should handle empty quotes', () => {
      expect(stripQuotes('""')).toBe('');
      expect(stripQuotes("''")).toBe('');
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

    test('should handle lines without = sign in encryptEnv', () => {
      const envContent = 'VALID_KEY=value\nINVALID_LINE_WITHOUT_EQUALS\nANOTHER_KEY=value2\n';
      fs.writeFileSync('.env', envContent);

      encryptEnv('.env');
      const encrypted = fs.readFileSync('.env', 'utf8');

      // Invalid line should be preserved as-is
      expect(encrypted).toContain('INVALID_LINE_WITHOUT_EQUALS');
    });

    test('should handle lines without = sign in decryptEnv', () => {
      const envContent = 'VALID_KEY=value\nINVALID_LINE\nANOTHER_KEY=value2\n';
      fs.writeFileSync('.env', envContent);

      const decrypted = decryptEnv('.env');

      // Invalid line should be preserved
      expect(decrypted).toContain('INVALID_LINE');
    });
  });

  describe('decryptValue edge cases', () => {
    test('should throw error for invalid encrypted format', () => {
      // Malformed aes: string (not 4 parts)
      expect(() => {
        decryptValue('aes:invalid:format');
      }).toThrow('Invalid encrypted value format');
    });

    test('should throw error for aes string with wrong prefix', () => {
      // Has 4 parts but invalid structure
      expect(() => {
        decryptValue('aes:part1:part2:part3:part4');
      }).toThrow();
    });
  });

  describe('encryptEnv edge cases', () => {
    test('should throw error if file does not exist', () => {
      expect(() => {
        encryptEnv('nonexistent.env');
      }).toThrow('nonexistent.env not found');
    });
  });

  describe('loadEnv with quotes', () => {
    test('should strip double quotes when loading to process.env', () => {
      const envContent = 'SITE_NAME="Uwupay Next"\nAPP_TITLE="My Awesome App"\n';
      fs.writeFileSync('.env', envContent);

      // Clear env
      delete process.env.SITE_NAME;
      delete process.env.APP_TITLE;

      loadEnv('.env');

      expect(process.env.SITE_NAME).toBe('Uwupay Next');
      expect(process.env.APP_TITLE).toBe('My Awesome App');
    });

    test('should strip single quotes when loading to process.env', () => {
      const envContent = "MESSAGE='Hello World'\nTITLE='Test App'\n";
      fs.writeFileSync('.env', envContent);

      // Clear env
      delete process.env.MESSAGE;
      delete process.env.TITLE;

      loadEnv('.env');

      expect(process.env.MESSAGE).toBe('Hello World');
      expect(process.env.TITLE).toBe('Test App');
    });

    test('should handle values without quotes', () => {
      const envContent = 'PORT=3000\nNODE_ENV=production\n';
      fs.writeFileSync('.env', envContent);

      // Clear env
      delete process.env.PORT;
      delete process.env.NODE_ENV;

      loadEnv('.env');

      expect(process.env.PORT).toBe('3000');
      expect(process.env.NODE_ENV).toBe('production');
    });

    test('should handle nested quotes correctly', () => {
      const envContent = `MESSAGE="He said 'hello'"\nALT="It's working"\n`;
      fs.writeFileSync('.env', envContent);

      // Clear env
      delete process.env.MESSAGE;
      delete process.env.ALT;

      loadEnv('.env');

      expect(process.env.MESSAGE).toBe("He said 'hello'");
      expect(process.env.ALT).toBe("It's working");
    });

    test('should handle empty quoted values', () => {
      const envContent = 'EMPTY_DOUBLE=""\nEMPTY_SINGLE=\'\'\n';
      fs.writeFileSync('.env', envContent);

      // Clear env
      delete process.env.EMPTY_DOUBLE;
      delete process.env.EMPTY_SINGLE;

      loadEnv('.env');

      expect(process.env.EMPTY_DOUBLE).toBe('');
      expect(process.env.EMPTY_SINGLE).toBe('');
    });
  });

  describe('encryptEnv with quotes', () => {
    test('should strip quotes before encrypting', () => {
      const envContent = 'API_KEY="secret123"\nDATABASE_URL="postgresql://localhost"\n';
      fs.writeFileSync('.env', envContent);

      encryptEnv('.env');

      // Verify values are encrypted
      const encrypted = fs.readFileSync('.env', 'utf8');
      expect(encrypted).toContain('aes:');

      // Verify decrypted values don't have quotes
      const decrypted = decryptEnv('.env');
      expect(decrypted).toContain('API_KEY=secret123');
      expect(decrypted).toContain('DATABASE_URL=postgresql://localhost');
      expect(decrypted).not.toContain('"secret123"');
      expect(decrypted).not.toContain('"postgresql://localhost"');
    });

    test('should handle mixed quoted and unquoted values', () => {
      const envContent = 'QUOTED="with quotes"\nNOT_QUOTED=without\nSINGLE=\'single\'\n';
      fs.writeFileSync('.env', envContent);

      encryptEnv('.env');
      const decrypted = decryptEnv('.env');

      expect(decrypted).toContain('QUOTED=with quotes');
      expect(decrypted).toContain('NOT_QUOTED=without');
      expect(decrypted).toContain('SINGLE=single');
    });
  });
});
