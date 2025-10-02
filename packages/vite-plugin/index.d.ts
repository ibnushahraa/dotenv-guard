import type { Plugin } from 'vite';

export interface DotenvGuardPluginOptions {
  /**
   * Enable multi-environment file loading
   * @default true
   */
  multiEnv?: boolean;

  /**
   * Enable encryption
   * @default false
   */
  enc?: boolean;

  /**
   * Enable schema validation
   * @default false
   */
  validator?: boolean;

  /**
   * Schema file path
   * @default 'env.schema.json'
   */
  schema?: string;

  /**
   * Single .env file path (overrides multiEnv)
   */
  path?: string;

  /**
   * Environment mode (auto-detected from Vite if not specified)
   */
  mode?: string;
}

/**
 * Vite plugin for dotenv-guard
 * Automatically loads and validates .env files with encryption support
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import dotenvGuard from '@ibnushahraa/vite-plugin-dotenv-guard';
 *
 * export default defineConfig({
 *   plugins: [
 *     dotenvGuard({
 *       validator: true,
 *       enc: false
 *     })
 *   ]
 * });
 * ```
 */
export default function dotenvGuardPlugin(options?: DotenvGuardPluginOptions): Plugin;
