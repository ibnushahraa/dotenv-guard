import fs from "fs";
import path from "path";

/**
 * Determine which .env files to load based on mode/environment
 * Priority (later files override earlier ones):
 * 1. .env
 * 2. .env.local
 * 3. .env.[mode]
 * 4. .env.[mode].local
 *
 * @param {string} [mode] - Environment mode (development/production/test), defaults to NODE_ENV or 'development'
 * @returns {string[]} Array of .env file paths to load (in order)
 */
export function getEnvFiles(mode) {
  const envMode = mode || process.env.NODE_ENV || 'development';

  const files = [
    '.env',
    '.env.local',
    `.env.${envMode}`,
    `.env.${envMode}.local`
  ];

  // Filter only existing files
  const cwd = process.cwd();
  return files
    .map(file => path.join(cwd, file))
    .filter(filePath => fs.existsSync(filePath));
}

/**
 * Determine schema file based on mode
 * Priority:
 * 1. env.schema.[mode].json
 * 2. env.schema.json
 *
 * @param {string} [mode] - Environment mode
 * @returns {string|null} Schema file path or null
 */
export function getSchemaFile(mode) {
  const envMode = mode || process.env.NODE_ENV || 'development';
  const cwd = process.cwd();

  const schemaFiles = [
    path.join(cwd, `env.schema.${envMode}.json`),
    path.join(cwd, 'env.schema.json')
  ];

  for (const file of schemaFiles) {
    if (fs.existsSync(file)) {
      return file;
    }
  }

  return null;
}
