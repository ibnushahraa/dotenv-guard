import fs from 'fs';
import path from 'path';
import { loadEnv, decryptValue, isEncrypted, encryptValue } from '@ibnushahraa/dotenv-guard';

describe('nuxt-dotenv-guard - Core Functionality', () => {
  const testEnvFile = path.join(process.cwd(), '.env.nuxt.test');
  const testSchemaFile = path.join(process.cwd(), 'env.schema.nuxt.test.json');

  beforeEach(() => {
    // Clean up test files
    if (fs.existsSync(testEnvFile)) fs.unlinkSync(testEnvFile);
    if (fs.existsSync(testSchemaFile)) fs.unlinkSync(testSchemaFile);

    // Clean up process.env
    delete process.env.NUXT_TEST_VAR;
    delete process.env.NUXT_DB_HOST;
    delete process.env.NUXT_DB_PASSWORD;
    delete process.env.NUXT_PUBLIC_API_URL;
    delete process.env.NUXT_PUBLIC_APP_NAME;
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testEnvFile)) fs.unlinkSync(testEnvFile);
    if (fs.existsSync(testSchemaFile)) fs.unlinkSync(testSchemaFile);

    // Clean up process.env
    delete process.env.NUXT_TEST_VAR;
    delete process.env.NUXT_DB_HOST;
    delete process.env.NUXT_DB_PASSWORD;
    delete process.env.NUXT_PUBLIC_API_URL;
    delete process.env.NUXT_PUBLIC_APP_NAME;
  });

  describe('Environment Loading (like module does)', () => {
    it('should load and decrypt environment variables', () => {
      const encrypted = encryptValue('secret_password');
      fs.writeFileSync(testEnvFile, `
NUXT_DB_HOST=localhost
NUXT_DB_PASSWORD=${encrypted}
`);

      // Simulate what module does
      const content = fs.readFileSync(testEnvFile, 'utf8');
      const envVars = {};

      for (const line of content.split(/\r?\n/)) {
        if (!line || line.trim() === '' || line.trim().startsWith('#')) continue;

        const idx = line.indexOf('=');
        if (idx === -1) continue;

        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();

        if (isEncrypted(value)) {
          value = decryptValue(value);
        }

        if (key) {
          envVars[key] = value;
          process.env[key] = value;
        }
      }

      expect(process.env.NUXT_DB_HOST).toBe('localhost');
      expect(process.env.NUXT_DB_PASSWORD).toBe('secret_password');
      expect(envVars.NUXT_DB_HOST).toBe('localhost');
      expect(envVars.NUXT_DB_PASSWORD).toBe('secret_password');
    });

    it('should handle plaintext values', () => {
      fs.writeFileSync(testEnvFile, 'NUXT_TEST_VAR=plaintext_value');

      const content = fs.readFileSync(testEnvFile, 'utf8');

      for (const line of content.split(/\r?\n/)) {
        if (!line || line.trim() === '' || line.trim().startsWith('#')) continue;

        const idx = line.indexOf('=');
        if (idx === -1) continue;

        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();

        if (isEncrypted(value)) {
          value = decryptValue(value);
        }

        if (key) {
          process.env[key] = value;
        }
      }

      expect(process.env.NUXT_TEST_VAR).toBe('plaintext_value');
    });

    it('should skip comments and empty lines', () => {
      fs.writeFileSync(testEnvFile, `
# This is a comment
NUXT_TEST_VAR=value

# Another comment

`);

      const content = fs.readFileSync(testEnvFile, 'utf8');
      let count = 0;

      for (const line of content.split(/\r?\n/)) {
        if (!line || line.trim() === '' || line.trim().startsWith('#')) continue;

        const idx = line.indexOf('=');
        if (idx === -1) continue;

        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();

        if (key) {
          process.env[key] = value;
          count++;
        }
      }

      expect(count).toBe(1);
      expect(process.env.NUXT_TEST_VAR).toBe('value');
    });
  });

  describe('Public Variables Detection (like module does)', () => {
    it('should identify NUXT_PUBLIC_ prefixed variables', () => {
      fs.writeFileSync(testEnvFile, `
NUXT_PUBLIC_API_URL=https://api.example.com
NUXT_PUBLIC_APP_NAME=Test App
NUXT_DB_PASSWORD=secret
`);

      const content = fs.readFileSync(testEnvFile, 'utf8');
      const envVars = {};
      const publicEnv = {};

      for (const line of content.split(/\r?\n/)) {
        if (!line || line.trim() === '' || line.trim().startsWith('#')) continue;

        const idx = line.indexOf('=');
        if (idx === -1) continue;

        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();

        if (key) {
          envVars[key] = value;

          // Check if it's a public var
          if (key.startsWith('NUXT_PUBLIC_')) {
            publicEnv[key] = value;
          }
        }
      }

      expect(Object.keys(publicEnv).length).toBe(2);
      expect(publicEnv.NUXT_PUBLIC_API_URL).toBe('https://api.example.com');
      expect(publicEnv.NUXT_PUBLIC_APP_NAME).toBe('Test App');
      expect(publicEnv.NUXT_DB_PASSWORD).toBeUndefined();
    });

    it('should not expose non-public variables', () => {
      fs.writeFileSync(testEnvFile, `
API_SECRET=secret_key
DB_HOST=localhost
DB_PASSWORD=pass123
`);

      const content = fs.readFileSync(testEnvFile, 'utf8');
      const publicEnv = {};

      for (const line of content.split(/\r?\n/)) {
        if (!line || line.trim() === '' || line.trim().startsWith('#')) continue;

        const idx = line.indexOf('=');
        if (idx === -1) continue;

        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();

        if (key && key.startsWith('NUXT_PUBLIC_')) {
          publicEnv[key] = value;
        }
      }

      expect(Object.keys(publicEnv).length).toBe(0);
    });
  });

  describe('Schema Validation (like module does)', () => {
    it('should validate required fields', () => {
      fs.writeFileSync(testEnvFile, 'NUXT_REQUIRED_VAR=testvalue');
      fs.writeFileSync(testSchemaFile, JSON.stringify({
        "NUXT_REQUIRED_VAR": { "required": true }
      }));

      const content = fs.readFileSync(testEnvFile, 'utf8');
      const envVars = {};

      for (const line of content.split(/\r?\n/)) {
        if (!line || line.trim() === '' || line.trim().startsWith('#')) continue;

        const idx = line.indexOf('=');
        if (idx === -1) continue;

        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();

        if (key) {
          envVars[key] = value;
        }
      }

      // Validate
      const schemaContent = fs.readFileSync(testSchemaFile, 'utf8');
      const rules = JSON.parse(schemaContent);
      const errors = [];

      for (const key in rules) {
        const value = envVars[key];
        const rule = rules[key];

        if (rule.required !== false && !value) {
          errors.push(`Missing required env: ${key}`);
        }
      }

      expect(errors.length).toBe(0);
      expect(envVars.NUXT_REQUIRED_VAR).toBe('testvalue');
    });

    it('should detect missing required fields', () => {
      fs.writeFileSync(testEnvFile, 'NUXT_OTHER_VAR=test');
      fs.writeFileSync(testSchemaFile, JSON.stringify({
        "NUXT_REQUIRED_VAR": { "required": true }
      }));

      const content = fs.readFileSync(testEnvFile, 'utf8');
      const envVars = {};

      for (const line of content.split(/\r?\n/)) {
        if (!line || line.trim() === '' || line.trim().startsWith('#')) continue;

        const idx = line.indexOf('=');
        if (idx === -1) continue;

        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();

        if (key) {
          envVars[key] = value;
        }
      }

      // Validate
      const schemaContent = fs.readFileSync(testSchemaFile, 'utf8');
      const rules = JSON.parse(schemaContent);
      const errors = [];

      for (const key in rules) {
        const value = envVars[key];
        const rule = rules[key];

        if (rule.required !== false && !value) {
          errors.push(`Missing required env: ${key}`);
        }
      }

      expect(errors.length).toBe(1);
      expect(errors[0]).toBe('Missing required env: NUXT_REQUIRED_VAR');
    });

    it('should validate regex patterns', () => {
      fs.writeFileSync(testEnvFile, 'NUXT_API_URL=https://api.example.com');
      fs.writeFileSync(testSchemaFile, JSON.stringify({
        "NUXT_API_URL": {
          "required": true,
          "regex": "^https?://"
        }
      }));

      const content = fs.readFileSync(testEnvFile, 'utf8');
      const envVars = {};

      for (const line of content.split(/\r?\n/)) {
        if (!line || line.trim() === '' || line.trim().startsWith('#')) continue;

        const idx = line.indexOf('=');
        if (idx === -1) continue;

        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();

        if (key) {
          envVars[key] = value;
        }
      }

      // Validate
      const schemaContent = fs.readFileSync(testSchemaFile, 'utf8');
      const rules = JSON.parse(schemaContent);
      const errors = [];

      for (const key in rules) {
        const value = envVars[key];
        const rule = rules[key];

        if (rule.regex && value && !new RegExp(rule.regex).test(value)) {
          errors.push(`Env ${key}="${value}" does not match ${rule.regex}`);
        }
      }

      expect(errors.length).toBe(0);
    });

    it('should validate enum values', () => {
      fs.writeFileSync(testEnvFile, 'NUXT_NODE_ENV=production');
      fs.writeFileSync(testSchemaFile, JSON.stringify({
        "NUXT_NODE_ENV": {
          "required": true,
          "enum": ["development", "production", "test"]
        }
      }));

      const content = fs.readFileSync(testEnvFile, 'utf8');
      const envVars = {};

      for (const line of content.split(/\r?\n/)) {
        if (!line || line.trim() === '' || line.trim().startsWith('#')) continue;

        const idx = line.indexOf('=');
        if (idx === -1) continue;

        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();

        if (key) {
          envVars[key] = value;
        }
      }

      // Validate
      const schemaContent = fs.readFileSync(testSchemaFile, 'utf8');
      const rules = JSON.parse(schemaContent);
      const errors = [];

      for (const key in rules) {
        const value = envVars[key];
        const rule = rules[key];

        if (rule.enum && value && !rule.enum.includes(value)) {
          errors.push(`Env ${key}="${value}" must be one of: ${rule.enum.join(", ")}`);
        }
      }

      expect(errors.length).toBe(0);
    });
  });

  describe('Encryption Integration', () => {
    it('should encrypt and decrypt values correctly', () => {
      const plaintext = 'my_secret_password';
      const encrypted = encryptValue(plaintext);

      expect(isEncrypted(encrypted)).toBe(true);
      expect(encrypted).toContain('aes:');

      const decrypted = decryptValue(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should handle multiple encrypted values', () => {
      const password = encryptValue('secret123');
      const apiKey = encryptValue('api_key_xyz');

      fs.writeFileSync(testEnvFile, `
NUXT_DB_PASSWORD=${password}
NUXT_API_KEY=${apiKey}
NUXT_DB_HOST=localhost
`);

      const content = fs.readFileSync(testEnvFile, 'utf8');
      const envVars = {};

      for (const line of content.split(/\r?\n/)) {
        if (!line || line.trim() === '' || line.trim().startsWith('#')) continue;

        const idx = line.indexOf('=');
        if (idx === -1) continue;

        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();

        if (isEncrypted(value)) {
          value = decryptValue(value);
        }

        if (key) {
          envVars[key] = value;
        }
      }

      expect(envVars.NUXT_DB_PASSWORD).toBe('secret123');
      expect(envVars.NUXT_API_KEY).toBe('api_key_xyz');
      expect(envVars.NUXT_DB_HOST).toBe('localhost');
    });
  });
});
