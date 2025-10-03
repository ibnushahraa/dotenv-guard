// ESM wrapper for crypto-based encryption (zero-config, no native deps)
import cryptoEncryption from './cryptoEncryption.js';
import * as keyManager from './keyManager.js';
import * as encryptionConfig from './encryptionConfig.js';

// Re-export all crypto encryption functions
export const encryptEnv = cryptoEncryption.encryptEnv;
export const decryptEnv = cryptoEncryption.decryptEnv;
export const loadEnv = cryptoEncryption.loadEnv;
export const encryptValue = cryptoEncryption.encryptValue;
export const decryptValue = cryptoEncryption.decryptValue;
export const isEncrypted = cryptoEncryption.isEncrypted;
export const isLegacyEncrypted = cryptoEncryption.isLegacyEncrypted;
export const loadSchema = cryptoEncryption.loadSchema;
export const validateEnv = cryptoEncryption.validateEnv;

// Key management
export const getOrCreateMasterKey = keyManager.getOrCreateMasterKey;
export const masterKeyExists = keyManager.masterKeyExists;

// Encryption config
export const loadEncryptionConfig = encryptionConfig.loadEncryptionConfig;
export const generateEncryptionConfig = encryptionConfig.generateEncryptionConfig;
export const saveEncryptionConfig = encryptionConfig.saveEncryptionConfig;

// Config function (zero-config, auto-encrypt/decrypt)
export function config(options = {}) {
  const file = options.path || '.env';

  // Always auto-decrypt (read-only, no file modification)
  cryptoEncryption.loadEnv(file);

  // Validation if requested
  if (options.validator) {
    const schema = cryptoEncryption.loadSchema(options.schema || 'env.schema.json');
    if (schema) {
      cryptoEncryption.validateEnv(process.env, schema);
    }
  }
}

export default {
  encryptEnv,
  decryptEnv,
  loadEnv,
  encryptValue,
  decryptValue,
  isEncrypted,
  isLegacyEncrypted,
  loadSchema,
  validateEnv,
  getOrCreateMasterKey,
  masterKeyExists,
  loadEncryptionConfig,
  generateEncryptionConfig,
  saveEncryptionConfig,
  config,
};
