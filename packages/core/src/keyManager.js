const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Store master key in user home directory (cross-platform)
const GLOBAL_KEY_DIR = path.join(os.homedir(), '.dotenv-guard');
const MASTER_KEY_FILE = 'master.key';

/**
 * Generate master key (symmetric AES key for encryption)
 * @returns {string} Hex-encoded 256-bit key
 */
function generateMasterKey() {
  return crypto.randomBytes(32).toString('hex'); // 256-bit key
}

/**
 * Save master key to global directory
 * @param {string} masterKey - Hex-encoded master key
 */
function saveMasterKey(masterKey) {
  if (!fs.existsSync(GLOBAL_KEY_DIR)) {
    fs.mkdirSync(GLOBAL_KEY_DIR, { recursive: true, mode: 0o700 });
  }

  const keyPath = path.join(GLOBAL_KEY_DIR, MASTER_KEY_FILE);
  fs.writeFileSync(keyPath, masterKey, { mode: 0o600 }); // Read/write for owner only

  return keyPath;
}

/**
 * Get or create master key (auto-generate on first use, like keytar)
 * @returns {string} Hex-encoded master key
 */
function getOrCreateMasterKey() {
  // Priority 1: Environment variable (for production/CI)
  if (process.env.DOTENV_GUARD_MASTER_KEY) {
    return process.env.DOTENV_GUARD_MASTER_KEY;
  }

  // Priority 2: Global key file in user home directory
  const keyPath = path.join(GLOBAL_KEY_DIR, MASTER_KEY_FILE);

  if (fs.existsSync(keyPath)) {
    return fs.readFileSync(keyPath, 'utf8').trim();
  }

  // Priority 3: Auto-generate and save (first time use)
  const masterKey = generateMasterKey();
  saveMasterKey(masterKey);

  return masterKey;
}

/**
 * Check if master key exists
 * @returns {boolean}
 */
function masterKeyExists() {
  const keyPath = path.join(GLOBAL_KEY_DIR, MASTER_KEY_FILE);
  return fs.existsSync(keyPath);
}

/**
 * Get master key directory path
 * @returns {string}
 */
function getKeyDir() {
  return GLOBAL_KEY_DIR;
}

module.exports = {
  generateMasterKey,
  saveMasterKey,
  getOrCreateMasterKey,
  masterKeyExists,
  getKeyDir,
  GLOBAL_KEY_DIR,
  MASTER_KEY_FILE
};
