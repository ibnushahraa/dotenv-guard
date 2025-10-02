/// <reference types="node" />

/**
 * Configuration options for dotenv-guard
 */
export interface ConfigOptions {
  /**
   * Path to .env file (single file mode, default: ".env")
   */
  path?: string;

  /**
   * Environment mode for multi-file loading (e.g., "development", "production", "test")
   * Uses NODE_ENV if not specified
   */
  mode?: string;

  /**
   * Enable multi-environment file loading (default: false)
   * When true, loads: .env → .env.local → .env.[mode] → .env.[mode].local
   */
  multiEnv?: boolean;

  /**
   * Enable encryption mode (default: true)
   * - true: ensures file is encrypted (encrypts plaintext values)
   * - false: ensures file is plaintext (decrypts encrypted values)
   */
  enc?: boolean;

  /**
   * Enable schema validation (default: false)
   */
  validator?: boolean;

  /**
   * Path to schema file (default: "env.schema.json")
   * Supports mode-specific schemas: "env.schema.[mode].json"
   */
  schema?: string;
}

/**
 * Schema rules for environment variable validation
 */
export interface SchemaRules {
  /**
   * Whether the environment variable is required
   */
  required?: boolean;

  /**
   * Regular expression pattern to validate the value
   */
  regex?: string;

  /**
   * List of allowed values (enum)
   */
  enum?: string[];
}

/**
 * Schema definition object
 */
export interface Schema {
  [key: string]: SchemaRules;
}

/**
 * Encrypt all values inside .env file.
 * Only encrypts values not already in "iv:cipher" format.
 * @param file - Path to .env file (default: ".env")
 *
 * @example
 * ```typescript
 * const { encryptEnv } = require('@ibnushahraa/dotenv-guard');
 *
 * encryptEnv('.env');
 * // or using CLI: npx dotenv-guard encrypt
 * ```
 */
export function encryptEnv(file?: string): void;

/**
 * Decrypt all values inside .env file and return as plaintext string.
 * This does not write back unless called explicitly.
 * @param file - Path to .env file (default: ".env")
 * @returns Plaintext .env content
 *
 * @example
 * ```typescript
 * const { decryptEnv } = require('@ibnushahraa/dotenv-guard');
 *
 * const plaintext = decryptEnv('.env');
 * console.log(plaintext);
 * // or using CLI: npx dotenv-guard decrypt
 * ```
 */
export function decryptEnv(file?: string): string;

/**
 * Load .env file into process.env
 * - If enc === true, ensures file is encrypted (encrypts plaintext values).
 * - If enc === false, ensures file is plaintext (decrypts encrypted values).
 * @param file - Path to .env file (default: ".env")
 * @param enc - Encryption mode (default: true)
 *
 * @example
 * ```typescript
 * const { loadEnv } = require('@ibnushahraa/dotenv-guard');
 *
 * // Load with encryption
 * loadEnv('.env', true);
 *
 * // Load without encryption
 * loadEnv('.env', false);
 * ```
 */
export function loadEnv(file?: string, enc?: boolean): void;

/**
 * API similar to dotenv.config()
 * Loads environment variables with optional encryption and validation
 * @param options - Configuration options
 *
 * @example
 * ```typescript
 * // Basic usage (like dotenv)
 * const { config } = require('@ibnushahraa/dotenv-guard');
 * config();
 *
 * // With validation
 * config({ validator: true });
 *
 * // Without encryption (for Vite projects)
 * config({
 *   path: '.env',
 *   enc: false,
 *   validator: true
 * });
 *
 * // Custom schema file
 * config({
 *   validator: true,
 *   schema: 'custom.schema.json'
 * });
 * ```
 */
export function config(options?: ConfigOptions): void;
