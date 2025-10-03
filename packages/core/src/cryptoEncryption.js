const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { getOrCreateMasterKey } = require('./keyManager');
const { loadEncryptionConfig, shouldEncrypt } = require('./encryptionConfig');

/**
 * Simple AES-256-GCM encryption with auto-generated master key
 * Format: "aes:<iv>:<authTag>:<encryptedData>"
 */

/**
 * Encrypt a single value using AES-256-GCM
 * @param {string} value - Plaintext value
 * @returns {string} Encrypted value in format "aes:ivHex:authTagHex:encryptedHex"
 */
function encryptValue(value) {
  const masterKey = getOrCreateMasterKey();
  const keyBuffer = Buffer.from(masterKey, 'hex');
  const iv = crypto.randomBytes(12); // GCM standard IV size

  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  return `aes:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt a single value using AES-256-GCM (new format) or legacy keytar format
 * @param {string} value - Encrypted string or plaintext
 * @returns {string} Plaintext value
 */
function decryptValue(value) {
  // New format (aes:iv:tag:cipher)
  if (value && value.startsWith('aes:')) {
    const parts = value.split(':');
    if (parts.length !== 4 || parts[0] !== 'aes') {
      throw new Error('Invalid encrypted value format');
    }

    const [, ivHex, authTagHex, encryptedHex] = parts;

    const masterKey = getOrCreateMasterKey();
    const keyBuffer = Buffer.from(masterKey, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  }

  // Legacy format (iv:cipher) - try to decrypt with legacy
  if (isLegacyEncrypted(value)) {
    // Try to load legacy encryption module
    let legacyEncryption = null;
    try {
      legacyEncryption = require('./encryption.js');
    } catch (err) {
      // Legacy module not available
    }

    if (legacyEncryption) {
      console.warn(`⚠️  [dotenv-guard] Legacy encrypted format detected. Consider running "npx dotenv-guard migrate" to upgrade.`);
      try {
        return legacyEncryption.decryptValue(value);
      } catch (err) {
        throw new Error(`Failed to decrypt legacy format: ${err.message}. Run "npx dotenv-guard migrate" to upgrade.`);
      }
    } else {
      throw new Error(`
Legacy encrypted format detected, but keytar is not available.

Migration required:
1. Install old version: npm install @ibnushahraa/dotenv-guard@1.2.3
2. Decrypt: npx dotenv-guard decrypt
3. Upgrade: npm install @ibnushahraa/dotenv-guard@latest
4. Re-encrypt: npx dotenv-guard encrypt

Or install keytar for backward compatibility:
   npm install keytar
      `);
    }
  }

  // Not encrypted, return as-is
  return value;
}

/**
 * Check if a value is encrypted with new format
 * @param {string} value
 * @returns {boolean}
 */
function isEncrypted(value) {
  return value && typeof value === 'string' && value.startsWith('aes:');
}

/**
 * Check if a value is encrypted with legacy keytar format
 * Legacy format: ivHex:cipherHex (32-char IV + encrypted data, no prefix)
 * @param {string} value
 * @returns {boolean}
 */
function isLegacyEncrypted(value) {
  if (!value || typeof value !== 'string') return false;

  const parts = value.split(':');
  if (parts.length !== 2) return false;

  const [ivHex, encryptedHex] = parts;

  // Legacy format: IV is exactly 32 hex chars (16 bytes)
  // Both parts must be hex
  return /^[0-9a-fA-F]{32}$/.test(ivHex) && /^[0-9a-fA-F]+$/.test(encryptedHex);
}

/**
 * Encrypt values in .env file (selective based on config)
 * @param {string} [file=".env"] - Path to .env file
 * @param {string} [outputFile] - Output file path (defaults to same as input)
 * @param {string} [configFile="env.enc.json"] - Encryption config file
 */
function encryptEnv(file = '.env', outputFile = null, configFile = 'env.enc.json') {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`${file} not found`);
  }

  // Load encryption config (optional)
  const encConfig = loadEncryptionConfig(configFile);

  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const output = [];

  let encryptedCount = 0;
  let plaintextCount = 0;

  for (const line of lines) {
    // Keep empty lines and comments as-is
    if (!line || line.trim() === '' || line.trim().startsWith('#')) {
      output.push(line);
      continue;
    }

    const idx = line.indexOf('=');
    if (idx === -1) {
      output.push(line);
      continue;
    }

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    // Check if already encrypted
    if (isEncrypted(value)) {
      output.push(`${key}=${value}`);
      encryptedCount++;
      continue;
    }

    // Check if this key should be encrypted
    if (shouldEncrypt(key, encConfig)) {
      value = encryptValue(value);
      encryptedCount++;
    } else {
      plaintextCount++;
    }

    output.push(`${key}=${value}`);
  }

  const outPath = outputFile ? path.join(process.cwd(), outputFile) : filePath;
  fs.writeFileSync(outPath, output.join('\n'));

  // Log summary
  if (encConfig) {
    console.log(`[dotenv-guard] Encrypted: ${encryptedCount} keys, Plaintext: ${plaintextCount} keys`);
  }

  return outPath;
}

/**
 * Decrypt all values in .env file and return as plaintext string
 * @param {string} [file=".env"] - Path to .env file
 * @returns {string} Plaintext .env content
 */
function decryptEnv(file = '.env') {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`${file} not found`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const output = [];

  for (const line of lines) {
    if (!line || line.trim() === '' || line.trim().startsWith('#')) {
      output.push(line);
      continue;
    }

    const idx = line.indexOf('=');
    if (idx === -1) {
      output.push(line);
      continue;
    }

    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();

    const plainValue = decryptValue(value);
    output.push(`${key}=${plainValue}`);
  }

  return output.join('\n');
}

/**
 * Inject environment variables into process.env
 * Decrypts values if needed.
 * @param {string} content - Raw .env file content
 * @param {boolean} [skipDecrypt=false] - Skip decryption (load as-is)
 */
function injectToProcess(content, skipDecrypt = false) {
  if (!content) return;

  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim() === '' || line.trim().startsWith('#')) continue;

    const idx = line.indexOf('=');
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();

    const plainValue = (skipDecrypt || !isEncrypted(value)) ? value : decryptValue(value);
    if (key) process.env[key] = plainValue;
  }
}

/**
 * Load .env file into process.env with decryption
 * @param {string} [file=".env"] - Path to .env file
 */
function loadEnv(file = '.env') {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`${file} not found`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  injectToProcess(content);
}

module.exports = {
  encryptValue,
  decryptValue,
  isEncrypted,
  isLegacyEncrypted,
  encryptEnv,
  decryptEnv,
  loadEnv,
  injectToProcess
};
