const dotenvGuardPlugin = require('../src/index.js');

describe('vite-plugin-dotenv-guard', () => {
  it('should export a function', () => {
    expect(typeof dotenvGuardPlugin).toBe('function');
  });

  it('should return a valid Vite plugin object', () => {
    const plugin = dotenvGuardPlugin();

    expect(plugin).toHaveProperty('name', 'vite-plugin-dotenv-guard');
    expect(plugin).toHaveProperty('config');
    expect(plugin).toHaveProperty('configResolved');
    expect(typeof plugin.config).toBe('function');
    expect(typeof plugin.configResolved).toBe('function');
  });

  it('should accept options and use defaults', () => {
    const plugin = dotenvGuardPlugin({
      validator: true,
      enc: true
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

  describe('config hook', () => {
    it('should return config object', () => {
      const plugin = dotenvGuardPlugin();
      const mockConfig = {};
      const mockEnv = { mode: 'development' };

      const result = plugin.config(mockConfig, mockEnv);

      expect(result).toBe(mockConfig);
    });

    it('should use mode from Vite', () => {
      const plugin = dotenvGuardPlugin();
      const mockConfig = {};
      const mockEnv = { mode: 'production' };

      const result = plugin.config(mockConfig, mockEnv);

      expect(result).toBe(mockConfig);
    });

    it('should default to development mode', () => {
      const plugin = dotenvGuardPlugin();
      const mockConfig = {};
      const mockEnv = {};

      const result = plugin.config(mockConfig, mockEnv);

      expect(result).toBe(mockConfig);
    });
  });

  describe('configResolved hook', () => {
    it('should handle serve command', () => {
      const plugin = dotenvGuardPlugin({ validator: true, enc: true });
      const mockResolvedConfig = {
        command: 'serve',
        mode: 'development',
        envPrefix: 'VITE_'
      };

      // Should not throw
      expect(() => {
        plugin.configResolved(mockResolvedConfig);
      }).not.toThrow();
    });

    it('should handle build command', () => {
      const plugin = dotenvGuardPlugin();
      const mockResolvedConfig = {
        command: 'build',
        mode: 'production',
        envPrefix: 'VITE_'
      };

      // Should not throw
      expect(() => {
        plugin.configResolved(mockResolvedConfig);
      }).not.toThrow();
    });

    it('should handle array envPrefix', () => {
      const plugin = dotenvGuardPlugin();
      const mockResolvedConfig = {
        command: 'serve',
        mode: 'development',
        envPrefix: ['VITE_', 'APP_']
      };

      // Should not throw
      expect(() => {
        plugin.configResolved(mockResolvedConfig);
      }).not.toThrow();
    });
  });
});
