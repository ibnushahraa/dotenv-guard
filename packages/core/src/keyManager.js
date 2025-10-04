const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Fallback directories for key storage
function getKeyDirectory() {
  // Priority 1: User home directory (most common)
  try {
    const homeDir = os.homedir();
    if (homeDir && homeDir !== '/') {
      const keyDir = path.join(homeDir, '.dotenv-guard');
      // Test if we can write to this directory
      try {
        if (!fs.existsSync(keyDir)) {
          fs.mkdirSync(keyDir, { recursive: true, mode: 0o700 });
        }
        // Test write access
        const testFile = path.join(keyDir, '.write-test');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        return keyDir;
      } catch (e) {
        // Home directory exists but not writable, try fallback
      }
    }
  } catch (e) {
    // Home directory not available
  }

  // Priority 2: Current working directory (for containers/serverless)
  try {
    const cwdKeyDir = path.join(process.cwd(), '.dotenv-guard');
    if (!fs.existsSync(cwdKeyDir)) {
      fs.mkdirSync(cwdKeyDir, { recursive: true, mode: 0o700 });
    }
    // Test write access
    const testFile = path.join(cwdKeyDir, '.write-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return cwdKeyDir;
  } catch (e) {
    // CWD not writable
  }

  // Priority 3: Temp directory (last resort for serverless/lambda)
  try {
    const tmpKeyDir = path.join(os.tmpdir(), '.dotenv-guard');
    if (!fs.existsSync(tmpKeyDir)) {
      fs.mkdirSync(tmpKeyDir, { recursive: true, mode: 0o700 });
    }
    return tmpKeyDir;
  } catch (e) {
    // Even temp dir failed
  }

  // No writable directory available - will force env var usage
  return null;
}

const MASTER_KEY_FILE = 'master.key';

/**
 * Generate master key (symmetric AES key for encryption)
 * @returns {string} Hex-encoded 256-bit key
 */
function generateMasterKey() {
  return crypto.randomBytes(32).toString('hex'); // 256-bit key
}

/**
 * Save master key to available directory
 * @param {string} masterKey - Hex-encoded master key
 */
function saveMasterKey(masterKey) {
  const keyDir = getKeyDirectory();

  if (!keyDir) {
    throw new Error(
      'No writable directory found for master key storage. ' +
      'Please set DOTENV_GUARD_MASTER_KEY environment variable.'
    );
  }

  const keyPath = path.join(keyDir, MASTER_KEY_FILE);
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

  // Priority 2: Check all possible key file locations
  const keyDir = getKeyDirectory();

  if (keyDir) {
    const keyPath = path.join(keyDir, MASTER_KEY_FILE);

    if (fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath, 'utf8').trim();
    }

    // Priority 3: Auto-generate and save (first time use)
    const masterKey = generateMasterKey();
    saveMasterKey(masterKey);

    return masterKey;
  }

  // No writable location available
  throw new Error(
    'Cannot generate master key: no writable directory found. ' +
    'Please set DOTENV_GUARD_MASTER_KEY environment variable.'
  );
}

/**
 * Check if master key exists
 * @returns {boolean}
 */
function masterKeyExists() {
  if (process.env.DOTENV_GUARD_MASTER_KEY) {
    return true;
  }

  const keyDir = getKeyDirectory();
  if (!keyDir) return false;

  const keyPath = path.join(keyDir, MASTER_KEY_FILE);
  return fs.existsSync(keyPath);
}

/**
 * Get master key directory path (for compatibility)
 * @returns {string|null}
 */
function getKeyDir() {
  return getKeyDirectory();
}

module.exports = {
  generateMasterKey,
  saveMasterKey,
  getOrCreateMasterKey,
  masterKeyExists,
  getKeyDir,
  getKeyDirectory,
  MASTER_KEY_FILE
};
