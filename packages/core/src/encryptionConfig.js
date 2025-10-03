const fs = require('fs');
const path = require('path');

/**
 * Load encryption configuration
 * @param {string} [configFile='env.enc.json'] - Path to encryption config file
 * @returns {Object|null} { encrypt: string[], plaintext: string[] } or null if not found
 */
function loadEncryptionConfig(configFile = 'env.enc.json') {
  const configPath = path.join(process.cwd(), configFile);

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(content);

    // Validate config structure
    if (!config.encrypt && !config.plaintext) {
      console.warn('[dotenv-guard] Invalid enc config: missing "encrypt" or "plaintext" arrays');
      return null;
    }

    return {
      encrypt: Array.isArray(config.encrypt) ? config.encrypt : [],
      plaintext: Array.isArray(config.plaintext) ? config.plaintext : []
    };
  } catch (err) {
    console.error('[dotenv-guard] Failed to parse encryption config:', err.message);
    return null;
  }
}

/**
 * Check if a key should be encrypted based on config
 * @param {string} key - Environment variable key
 * @param {Object|null} config - Encryption config
 * @returns {boolean}
 */
function shouldEncrypt(key, config) {
  if (!config) {
    // No config: encrypt all by default
    return true;
  }

  // If key is in plaintext list, don't encrypt
  if (config.plaintext && config.plaintext.includes(key)) {
    return false;
  }

  // If encrypt list exists and key is in it, encrypt
  if (config.encrypt && config.encrypt.length > 0) {
    return config.encrypt.includes(key);
  }

  // If only plaintext list exists, encrypt everything not in plaintext
  if (config.plaintext && config.plaintext.length > 0) {
    return !config.plaintext.includes(key);
  }

  // Default: encrypt all
  return true;
}

/**
 * Generate encryption config from .env file
 * Prompts user or uses heuristics to determine which keys to encrypt
 * @param {string} [envFile='.env'] - Path to .env file
 * @returns {Object} { encrypt: string[], plaintext: string[] }
 */
function generateEncryptionConfig(envFile = '.env') {
  const envPath = path.join(process.cwd(), envFile);

  if (!fs.existsSync(envPath)) {
    throw new Error(`${envFile} not found`);
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);

  const encrypt = [];
  const plaintext = [];

  // Common patterns for sensitive keys
  const sensitivePatterns = [
    /password/i,
    /secret/i,
    /key/i,
    /token/i,
    /auth/i,
    /credential/i,
    /private/i,
    /api_key/i,
    /database_url/i,
    /db_/i,
  ];

  // Common patterns for non-sensitive keys
  const publicPatterns = [
    /^port$/i,
    /^host$/i,
    /^node_env$/i,
    /^env$/i,
    /^log_level$/i,
    /^debug$/i,
    /^verbose$/i,
    /^vite_/i, // Vite public vars
  ];

  for (const line of lines) {
    if (!line || line.trim() === '' || line.trim().startsWith('#')) continue;

    const idx = line.indexOf('=');
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();

    // Check if public
    const isPublic = publicPatterns.some(pattern => pattern.test(key));
    if (isPublic) {
      plaintext.push(key);
      continue;
    }

    // Check if sensitive
    const isSensitive = sensitivePatterns.some(pattern => pattern.test(key));
    if (isSensitive) {
      encrypt.push(key);
      continue;
    }

    // Default: add to encrypt list (safer)
    encrypt.push(key);
  }

  return { encrypt, plaintext };
}

/**
 * Save encryption config to file
 * @param {Object} config - { encrypt: string[], plaintext: string[] }
 * @param {string} [configFile='env.enc.json'] - Output file path
 */
function saveEncryptionConfig(config, configFile = 'env.enc.json') {
  const configPath = path.join(process.cwd(), configFile);
  const content = JSON.stringify(config, null, 2);
  fs.writeFileSync(configPath, content);
  return configPath;
}

module.exports = {
  loadEncryptionConfig,
  shouldEncrypt,
  generateEncryptionConfig,
  saveEncryptionConfig
};
