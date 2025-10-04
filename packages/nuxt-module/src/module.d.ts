import { ModuleOptions } from '@nuxt/schema'

export interface DotenvGuardOptions {
  /**
   * Path to .env file
   * @default Auto-detected based on dev mode (.env.development or .env.production)
   */
  path?: string

  /**
   * Enable schema validation
   * @default false
   */
  validator?: boolean

  /**
   * Schema file path
   * @default 'env.schema.json'
   */
  schema?: string
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    dotenvGuard?: DotenvGuardOptions
  }
  interface NuxtOptions {
    dotenvGuard?: DotenvGuardOptions
  }
}

export default ModuleOptions
