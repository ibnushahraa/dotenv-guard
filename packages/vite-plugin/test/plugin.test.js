const dotenvGuardPlugin = require('../src/index.js');
const fs = require('fs');
const path = require('path');

describe('vite-plugin-dotenv-guard', () => {
  const testEnvFile = path.join(process.cwd(), '.env.test');
  const testSchemaFile = path.join(process.cwd(), 'env.schema.test.json');

  beforeEach(() => {
    // Clean up test files
    if (fs.existsSync(testEnvFile)) fs.unlinkSync(testEnvFile);
    if (fs.existsSync(testSchemaFile)) fs.unlinkSync(testSchemaFile);
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testEnvFile)) fs.unlinkSync(testEnvFile);
    if (fs.existsSync(testSchemaFile)) fs.unlinkSync(testSchemaFile);
  });

  it('should export a function', () => {
    expect(typeof dotenvGuardPlugin).toBe('function');
  });

  it('should return a valid Vite plugin object', () => {
    const plugin = dotenvGuardPlugin();

    expect(plugin).toHaveProperty('name', 'vite-plugin-dotenv-guard');
    expect(plugin).toHaveProperty('config');
    expect(typeof plugin.config).toBe('function');
  });

  it('should accept options and use defaults', () => {
    const plugin = dotenvGuardPlugin({
      validator: true
    });

    expect(plugin).toHaveProperty('name', 'vite-plugin-dotenv-guard');
  });

  it('should work with empty options', () => {
    const plugin = dotenvGuardPlugin({});

    expect(plugin).toHaveProperty('name', 'vite-plugin-dotenv-guard');
  });

  it('should work without options', () => {
    const plugin = dotenvGuardPlugin();

    expect(plugin).toHaveProperty('name', 'vite-plugin-dotenv-guard');
  });

  it('should have default export', () => {
    expect(dotenvGuardPlugin.default).toBe(dotenvGuardPlugin);
  });

  it('should handle path option (single file mode)', () => {
    const plugin = dotenvGuardPlugin({
      path: '.env.custom'
    });

    expect(plugin).toHaveProperty('name', 'vite-plugin-dotenv-guard');
  });

  it('should handle schema option', () => {
    const plugin = dotenvGuardPlugin({
      validator: true,
      schema: 'custom.schema.json'
    });

    expect(plugin).toHaveProperty('name', 'vite-plugin-dotenv-guard');
  });

  describe('config hook (async)', () => {
    it('should return config object (auto-detect mode)', async () => {
      // Create test env file
      fs.writeFileSync(testEnvFile, 'TEST_VAR=value123');

      const plugin = dotenvGuardPlugin({ path: '.env.test' });
      const mockConfig = {};
      const mockEnv = { mode: 'test' };

      const result = await plugin.config(mockConfig, mockEnv);

      expect(result).toBe(mockConfig);
      expect(process.env.TEST_VAR).toBe('value123');

      delete process.env.TEST_VAR;
    });

    it('should auto-detect based on mode', async () => {
      const plugin = dotenvGuardPlugin();
      const mockConfig = {};
      const mockEnv = { mode: 'development' };

      const result = await plugin.config(mockConfig, mockEnv);

      expect(result).toBe(mockConfig);
    });

    it('should handle missing file gracefully', async () => {
      const plugin = dotenvGuardPlugin({ path: '.env.nonexistent' });
      const mockConfig = {};
      const mockEnv = { mode: 'development' };

      const result = await plugin.config(mockConfig, mockEnv);

      expect(result).toBe(mockConfig);
    });

    it('should validate with schema', async () => {
      // Create test files
      fs.writeFileSync(testEnvFile, 'REQUIRED_VAR=testvalue');
      fs.writeFileSync(testSchemaFile, JSON.stringify({
        "REQUIRED_VAR": { "required": true }
      }));

      const plugin = dotenvGuardPlugin({
        path: '.env.test',
        validator: true,
        schema: 'env.schema.test.json'
      });
      const mockConfig = {};
      const mockEnv = { mode: 'test' };

      const result = await plugin.config(mockConfig, mockEnv);

      expect(result).toBe(mockConfig);
      expect(process.env.REQUIRED_VAR).toBe('testvalue');

      delete process.env.REQUIRED_VAR;
    });

    it('should fail validation when required var missing', async () => {
      // Create test files
      fs.writeFileSync(testEnvFile, 'OTHER_VAR=test');
      fs.writeFileSync(testSchemaFile, JSON.stringify({
        "REQUIRED_VAR": { "required": true }
      }));

      const plugin = dotenvGuardPlugin({
        path: '.env.test',
        validator: true,
        schema: 'env.schema.test.json'
      });
      const mockConfig = {};
      const mockEnv = { mode: 'test' };

      await expect(plugin.config(mockConfig, mockEnv)).rejects.toThrow('Environment validation failed');

      delete process.env.OTHER_VAR;
    });

    it('should surface decryption errors with context', async () => {
      const core = require('@ibnushahraa/dotenv-guard');
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      // Ensure encrypted value is generated with a different key than the one used during decrypt
      process.env.DOTENV_GUARD_MASTER_KEY = '2'.repeat(64);
      const encrypted = core.encryptValue('super-secret');
      process.env.DOTENV_GUARD_MASTER_KEY = '1'.repeat(64);

      fs.writeFileSync(testEnvFile, `SECRET=${encrypted}`);

      const plugin = dotenvGuardPlugin({
        path: '.env.test'
      });

      await expect(plugin.config({}, { mode: 'test' })).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalled();

      delete process.env.DOTENV_GUARD_MASTER_KEY;
      errorSpy.mockRestore();
    });

    it('should warn when schema file missing during validation', async () => {
      fs.writeFileSync(testEnvFile, 'PLAIN=value');
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

      const plugin = dotenvGuardPlugin({
        path: '.env.test',
        validator: true,
        schema: 'missing.schema.json'
      });

      const mockConfig = {};
      const result = await plugin.config(mockConfig, { mode: 'test' });
      expect(result).toBe(mockConfig);
      expect(warnSpy).toHaveBeenCalledWith('[dotenv-guard] Schema file not found: missing.schema.json');

      warnSpy.mockRestore();
    });
  });
});
