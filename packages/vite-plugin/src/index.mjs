import fs from "fs";
import path from "path";
import { decryptValue, isEncrypted } from "@ibnushahraa/dotenv-guard";

/**
 * Vite plugin for dotenv-guard with encryption support
 * @param {Object} options - Plugin options
 * @param {string} [options.path] - Path to .env file
 * @param {boolean} [options.validator=false] - Enable validation
 * @param {string} [options.schema='env.schema.json'] - Schema file path
 * @returns {import('vite').Plugin}
 */
export default function dotenvGuard(options = {}) {
  const {
    path: envPath,
    validator = false,
    schema = 'env.schema.json',
  } = options;

  return {
    name: 'vite-plugin-dotenv-guard',

    async config(viteConfig, { mode }) {
      // Auto-detect based on mode if path not specified
      const finalPath = envPath || `.env.${mode}`;
      const filePath = path.join(process.cwd(), finalPath);

      if (!fs.existsSync(filePath)) {
        console.warn(`[dotenv-guard] File not found: ${finalPath}`);
        return viteConfig;
      }

      // Load .env file
      const content = fs.readFileSync(filePath, 'utf8');

      // Parse and inject into process.env (with auto-decryption)
      for (const line of content.split(/\r?\n/)) {
        if (!line || line.trim() === '' || line.trim().startsWith('#')) continue;

        const idx = line.indexOf('=');
        if (idx === -1) continue;

        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();

        // Auto-decrypt encrypted values
        if (isEncrypted(value)) {
          try {
            value = decryptValue(value);
          } catch (err) {
            console.error(`[dotenv-guard] Failed to decrypt ${key}:`, err.message);
            throw err;
          }
        }

        if (key) process.env[key] = value;
      }

      // Validation (same as core)
      if (validator) {
        const schemaPath = path.join(process.cwd(), schema);

        if (!fs.existsSync(schemaPath)) {
          console.warn(`[dotenv-guard] Schema file not found: ${schema}`);
          return viteConfig;
        }

        const schemaContent = fs.readFileSync(schemaPath, 'utf8');
        const rules = JSON.parse(schemaContent);

        // Validate
        const errors = [];
        for (const key in rules) {
          const value = process.env[key];
          const rule = rules[key];

          if (rule.required !== false && !value) {
            errors.push(`Missing required env: ${key}`);
            continue;
          }

          if (rule.regex && value && !new RegExp(rule.regex).test(value)) {
            errors.push(`Env ${key}="${value}" does not match ${rule.regex}`);
          }

          if (rule.enum && value && !rule.enum.includes(value)) {
            errors.push(`Env ${key}="${value}" must be one of: ${rule.enum.join(", ")}`);
          }
        }

        if (errors.length > 0) {
          errors.forEach(e => console.error('❌', e));
          console.error('⛔ dotenv-guard: validation failed.');
          throw new Error('Environment validation failed');
        }
      }

      console.log(`[dotenv-guard] Loaded: ${finalPath} (mode: ${mode})`);
      return viteConfig;
    }
  };
}
