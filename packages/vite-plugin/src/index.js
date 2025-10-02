const { config: loadConfig } = require('@ibnushahraa/dotenv-guard');

/**
 * Vite plugin for dotenv-guard
 * Automatically loads and validates .env files with encryption support
 *
 * @param {Object} options - Plugin options
 * @param {boolean} [options.multiEnv=true] - Enable multi-environment file loading
 * @param {boolean} [options.enc=false] - Enable encryption (default: false for Vite)
 * @param {boolean} [options.validator=false] - Enable schema validation
 * @param {string} [options.schema='env.schema.json'] - Schema file path
 * @param {string} [options.path] - Single .env file path (overrides multiEnv)
 * @returns {import('vite').Plugin}
 */
function dotenvGuardPlugin(options = {}) {
  const {
    multiEnv = true,
    enc = false,
    validator = false,
    schema = 'env.schema.json',
    path,
    ...restOptions
  } = options;

  return {
    name: 'vite-plugin-dotenv-guard',

    // Load env files before Vite's config is resolved
    config(viteConfig, { mode }) {
      // Prepare config options
      const configOptions = {
        multiEnv: path ? false : multiEnv, // Disable multiEnv if path is specified
        mode: mode || 'development',
        enc,
        validator,
        schema,
        ...restOptions
      };

      // Add path if specified
      if (path) {
        configOptions.path = path;
      }

      // Load environment variables
      loadConfig(configOptions);

      return viteConfig;
    },

    // Expose env vars to client (with VITE_ prefix only)
    configResolved(resolvedConfig) {
      const envPrefix = resolvedConfig.envPrefix || 'VITE_';
      const prefixes = Array.isArray(envPrefix) ? envPrefix : [envPrefix];

      // Log loaded env files in dev mode
      if (resolvedConfig.command === 'serve') {
        const mode = resolvedConfig.mode;
        console.log(`[dotenv-guard] Loaded environment: ${mode}`);

        if (validator) {
          console.log(`[dotenv-guard] Schema validation: enabled`);
        }

        if (enc) {
          console.log(`[dotenv-guard] Encryption: enabled`);
        }
      }
    }
  };
}

module.exports = dotenvGuardPlugin;
module.exports.default = dotenvGuardPlugin;
