const fs = require('fs');
const path = require('path');
const {
  loadEncryptionConfig,
  shouldEncrypt,
  generateEncryptionConfig,
  saveEncryptionConfig
} = require('../src/encryptionConfig');
const { encryptEnv, decryptEnv, isEncrypted } = require('../src/cryptoEncryption');
const { generateMasterKey } = require('../src/keyManager');

describe('Selective Encryption', () => {
  let testDir;
  let testMasterKey;

  beforeAll(() => {
    testMasterKey = generateMasterKey();
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

  describe('loadEncryptionConfig', () => {
    test('should load valid encryption config', () => {
      const config = {
        encrypt: ['DB_PASSWORD', 'API_KEY'],
        plaintext: ['PORT', 'NODE_ENV']
      };
      fs.writeFileSync('env.enc.json', JSON.stringify(config));

      const loaded = loadEncryptionConfig();
      expect(loaded).toEqual(config);
    });

    test('should return null if config file does not exist', () => {
      const loaded = loadEncryptionConfig();
      expect(loaded).toBeNull();
    });

    test('should return null for invalid config', () => {
      fs.writeFileSync('env.enc.json', JSON.stringify({ invalid: true }));
      const loaded = loadEncryptionConfig();
      expect(loaded).toBeNull();
    });

    test('should handle malformed JSON', () => {
      fs.writeFileSync('env.enc.json', 'not valid json');
      const loaded = loadEncryptionConfig();
      expect(loaded).toBeNull();
    });
  });

  describe('shouldEncrypt', () => {
    test('should encrypt all keys when no config provided', () => {
      expect(shouldEncrypt('DATABASE_URL', null)).toBe(true);
      expect(shouldEncrypt('PORT', null)).toBe(true);
      expect(shouldEncrypt('ANY_KEY', null)).toBe(true);
    });

    test('should respect encrypt list', () => {
      const config = {
        encrypt: ['DB_PASSWORD', 'API_KEY'],
        plaintext: []
      };

      expect(shouldEncrypt('DB_PASSWORD', config)).toBe(true);
      expect(shouldEncrypt('API_KEY', config)).toBe(true);
      expect(shouldEncrypt('PORT', config)).toBe(false);
    });

    test('should respect plaintext list', () => {
      const config = {
        encrypt: [],
        plaintext: ['PORT', 'NODE_ENV']
      };

      expect(shouldEncrypt('PORT', config)).toBe(false);
      expect(shouldEncrypt('NODE_ENV', config)).toBe(false);
      expect(shouldEncrypt('DB_PASSWORD', config)).toBe(true);
    });

    test('should prioritize plaintext over encrypt list', () => {
      const config = {
        encrypt: ['DB_PASSWORD', 'PORT'],
        plaintext: ['PORT']
      };

      expect(shouldEncrypt('PORT', config)).toBe(false);
      expect(shouldEncrypt('DB_PASSWORD', config)).toBe(true);
    });

    test('should encrypt when both lists exist and key in encrypt list', () => {
      const config = {
        encrypt: ['DB_PASSWORD', 'API_KEY'],
        plaintext: ['PORT', 'NODE_ENV']
      };

      expect(shouldEncrypt('DB_PASSWORD', config)).toBe(true);
      expect(shouldEncrypt('API_KEY', config)).toBe(true);
      expect(shouldEncrypt('PORT', config)).toBe(false);
      expect(shouldEncrypt('UNKNOWN_KEY', config)).toBe(false);
    });
  });

  describe('generateEncryptionConfig', () => {
    test('should generate config from .env file', () => {
      const envContent = `
DATABASE_URL=postgresql://localhost
API_KEY=secret123
DB_PASSWORD=mypassword
PORT=3000
NODE_ENV=development
VITE_API_URL=https://api.example.com
`;
      fs.writeFileSync('.env', envContent);

      const config = generateEncryptionConfig('.env');

      expect(config.encrypt).toContain('DATABASE_URL');
      expect(config.encrypt).toContain('API_KEY');
      expect(config.encrypt).toContain('DB_PASSWORD');
      expect(config.plaintext).toContain('PORT');
      expect(config.plaintext).toContain('NODE_ENV');
      expect(config.plaintext).toContain('VITE_API_URL');
    });

    test('should detect sensitive patterns', () => {
      const envContent = `
MY_PASSWORD=secret
AUTH_TOKEN=token123
SECRET_KEY=mysecret
PRIVATE_DATA=private
`;
      fs.writeFileSync('.env', envContent);

      const config = generateEncryptionConfig('.env');

      expect(config.encrypt).toContain('MY_PASSWORD');
      expect(config.encrypt).toContain('AUTH_TOKEN');
      expect(config.encrypt).toContain('SECRET_KEY');
      expect(config.encrypt).toContain('PRIVATE_DATA');
    });

    test('should detect public patterns', () => {
      const envContent = `
PORT=3000
HOST=localhost
NODE_ENV=production
LOG_LEVEL=info
DEBUG=true
VITE_APP_NAME=MyApp
`;
      fs.writeFileSync('.env', envContent);

      const config = generateEncryptionConfig('.env');

      expect(config.plaintext).toContain('PORT');
      expect(config.plaintext).toContain('HOST');
      expect(config.plaintext).toContain('NODE_ENV');
      expect(config.plaintext).toContain('LOG_LEVEL');
      expect(config.plaintext).toContain('DEBUG');
      expect(config.plaintext).toContain('VITE_APP_NAME');
    });

    test('should throw error if .env not found', () => {
      expect(() => generateEncryptionConfig('.env')).toThrow('.env not found');
    });
  });

  describe('saveEncryptionConfig', () => {
    test('should save config to file', () => {
      const config = {
        encrypt: ['DB_PASSWORD'],
        plaintext: ['PORT']
      };

      saveEncryptionConfig(config);

      expect(fs.existsSync('env.enc.json')).toBe(true);
      const saved = JSON.parse(fs.readFileSync('env.enc.json', 'utf8'));
      expect(saved).toEqual(config);
    });

    test('should save to custom file path', () => {
      const config = {
        encrypt: ['API_KEY'],
        plaintext: ['NODE_ENV']
      };

      saveEncryptionConfig(config, 'custom.enc.json');

      expect(fs.existsSync('custom.enc.json')).toBe(true);
      const saved = JSON.parse(fs.readFileSync('custom.enc.json', 'utf8'));
      expect(saved).toEqual(config);
    });
  });

  describe('encryptEnv with selective encryption', () => {
    test('should encrypt only specified keys', () => {
      const envContent = `DATABASE_URL=postgresql://localhost
API_KEY=secret123
PORT=3000
NODE_ENV=development
`;
      fs.writeFileSync('.env', envContent);

      const config = {
        encrypt: ['DATABASE_URL', 'API_KEY'],
        plaintext: ['PORT', 'NODE_ENV']
      };
      fs.writeFileSync('env.enc.json', JSON.stringify(config));

      encryptEnv('.env');

      const result = fs.readFileSync('.env', 'utf8');
      const lines = result.split('\n');

      // DATABASE_URL and API_KEY should be encrypted
      const dbLine = lines.find(l => l.startsWith('DATABASE_URL='));
      const apiLine = lines.find(l => l.startsWith('API_KEY='));
      expect(dbLine).toContain('aes:');
      expect(apiLine).toContain('aes:');

      // PORT and NODE_ENV should be plaintext
      const portLine = lines.find(l => l.startsWith('PORT='));
      const envLine = lines.find(l => l.startsWith('NODE_ENV='));
      expect(portLine).toBe('PORT=3000');
      expect(envLine).toBe('NODE_ENV=development');
    });

    test('should encrypt all keys when no config exists', () => {
      const envContent = `DATABASE_URL=postgresql://localhost
API_KEY=secret123
PORT=3000
`;
      fs.writeFileSync('.env', envContent);

      encryptEnv('.env');

      const result = fs.readFileSync('.env', 'utf8');
      const lines = result.split('\n');

      // All should be encrypted
      lines.forEach(line => {
        if (line && !line.startsWith('#') && line.includes('=')) {
          expect(line).toContain('aes:');
        }
      });
    });

    test('should preserve comments and empty lines', () => {
      const envContent = `# Comment
DATABASE_URL=postgresql://localhost

API_KEY=secret123
`;
      fs.writeFileSync('.env', envContent);

      const config = {
        encrypt: ['DATABASE_URL'],
        plaintext: ['API_KEY']
      };
      fs.writeFileSync('env.enc.json', JSON.stringify(config));

      encryptEnv('.env');

      const result = fs.readFileSync('.env', 'utf8');
      expect(result).toContain('# Comment');
      expect(result.split('\n').filter(l => l === '').length).toBeGreaterThan(0);
    });

    test('should not re-encrypt already encrypted values', () => {
      const envContent = `DATABASE_URL=postgresql://localhost`;
      fs.writeFileSync('.env', envContent);

      const config = {
        encrypt: ['DATABASE_URL'],
        plaintext: []
      };
      fs.writeFileSync('env.enc.json', JSON.stringify(config));

      // First encryption
      encryptEnv('.env');
      const firstResult = fs.readFileSync('.env', 'utf8');

      // Second encryption (should not change)
      encryptEnv('.env');
      const secondResult = fs.readFileSync('.env', 'utf8');

      expect(firstResult).toBe(secondResult);
    });
  });

  describe('decryptEnv with selective encryption', () => {
    test('should decrypt only encrypted values', () => {
      const envContent = `DATABASE_URL=postgresql://localhost
API_KEY=secret123
PORT=3000
NODE_ENV=development
`;
      fs.writeFileSync('.env', envContent);

      const config = {
        encrypt: ['DATABASE_URL', 'API_KEY'],
        plaintext: ['PORT', 'NODE_ENV']
      };
      fs.writeFileSync('env.enc.json', JSON.stringify(config));

      // Encrypt first
      encryptEnv('.env');

      // Then decrypt
      const decrypted = decryptEnv('.env');

      expect(decrypted).toContain('DATABASE_URL=postgresql://localhost');
      expect(decrypted).toContain('API_KEY=secret123');
      expect(decrypted).toContain('PORT=3000');
      expect(decrypted).toContain('NODE_ENV=development');
    });
  });

  describe('Integration test', () => {
    test('complete workflow: generate config -> encrypt -> decrypt', () => {
      // 1. Create .env with mixed sensitive/public data
      const envContent = `DATABASE_URL=postgresql://user:pass@localhost/db
API_SECRET_KEY=sk_live_abc123
STRIPE_SECRET=rk_test_xyz789
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
VITE_API_URL=https://api.example.com
`;
      fs.writeFileSync('.env', envContent);

      // 2. Generate encryption config
      const config = generateEncryptionConfig('.env');
      saveEncryptionConfig(config);

      // 3. Encrypt
      encryptEnv('.env');
      const encrypted = fs.readFileSync('.env', 'utf8');

      // 4. Verify encryption
      expect(encrypted).toContain('aes:'); // Has encrypted values
      expect(encrypted).toContain('PORT=3000'); // Has plaintext values
      expect(encrypted).toContain('VITE_API_URL=https://api.example.com');

      // 5. Decrypt and verify
      const decrypted = decryptEnv('.env');
      expect(decrypted).toContain('DATABASE_URL=postgresql://user:pass@localhost/db');
      expect(decrypted).toContain('API_SECRET_KEY=sk_live_abc123');
      expect(decrypted).toContain('PORT=3000');
      expect(decrypted).toContain('VITE_API_URL=https://api.example.com');
    });
  });
});
