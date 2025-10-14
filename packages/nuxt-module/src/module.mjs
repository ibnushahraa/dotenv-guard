/* istanbul ignore file -- Nuxt module requires runtime integration with Nuxt kit */
import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { loadEnv, decryptValue, isEncrypted } from '@ibnushahraa/dotenv-guard'
import fs from 'fs'
import path from 'path'

export default defineNuxtModule({
  meta: {
    name: '@ibnushahraa/nuxt-dotenv-guard',
    configKey: 'dotenvGuard',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  defaults: {
    path: undefined,        // Auto-detect based on NODE_ENV
    validator: false,       // Enable schema validation
    schema: 'env.schema.json'
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Determine environment file based on Nuxt dev mode
    const isDev = nuxt.options.dev
    const envFile = options.path || (isDev ? '.env.development' : '.env.production')
    const filePath = path.join(nuxt.options.rootDir, envFile)

    console.log(`[dotenv-guard] Loading: ${envFile} (mode: ${isDev ? 'development' : 'production'})`)

    if (!fs.existsSync(filePath)) {
      console.warn(`[dotenv-guard] File not found: ${envFile}`)
      return
    }

    // Load and decrypt .env file
    const content = fs.readFileSync(filePath, 'utf8')
    const envVars = {}

    for (const line of content.split(/\r?\n/)) {
      if (!line || line.trim() === '' || line.trim().startsWith('#')) continue

      const idx = line.indexOf('=')
      if (idx === -1) continue

      const key = line.slice(0, idx).trim()
      let value = line.slice(idx + 1).trim()

      // Auto-decrypt encrypted values
      if (isEncrypted(value)) {
        try {
          value = decryptValue(value)
        } catch (err) {
          console.error(`[dotenv-guard] Failed to decrypt ${key}:`, err.message)
          throw err
        }
      }

      if (key) {
        envVars[key] = value
        // Inject into process.env for server-side
        process.env[key] = value
      }
    }

    // Validation if requested
    if (options.validator) {
      const schemaPath = path.join(nuxt.options.rootDir, options.schema)

      if (!fs.existsSync(schemaPath)) {
        console.warn(`[dotenv-guard] Schema file not found: ${options.schema}`)
      } else {
        try {
          const schemaContent = fs.readFileSync(schemaPath, 'utf8')
          const rules = JSON.parse(schemaContent)

          // Validate
          const errors = []
          for (const key in rules) {
            const value = envVars[key]
            const rule = rules[key]

            if (rule.required !== false && !value) {
              errors.push(`Missing required env: ${key}`)
              continue
            }

            if (rule.regex && value && !new RegExp(rule.regex).test(value)) {
              errors.push(`Env ${key}="${value}" does not match ${rule.regex}`)
            }

            if (rule.enum && value && !rule.enum.includes(value)) {
              errors.push(`Env ${key}="${value}" must be one of: ${rule.enum.join(", ")}`)
            }
          }

          if (errors.length > 0) {
            errors.forEach(e => console.error('❌', e))
            throw new Error('Environment validation failed')
          }
        } catch (err) {
          if (err.message === 'Environment validation failed') throw err
          console.error('[dotenv-guard] Validation error:', err.message)
        }
      }
    }

    // Expose public runtime config (for client-side)
    // Only expose variables with NUXT_PUBLIC_ prefix
    const publicEnv = {}
    for (const key in envVars) {
      if (key.startsWith('NUXT_PUBLIC_')) {
        publicEnv[key] = envVars[key]
      }
    }

    if (Object.keys(publicEnv).length > 0) {
      nuxt.options.runtimeConfig.public = {
        ...nuxt.options.runtimeConfig.public,
        ...publicEnv
      }
    }

    // Add plugin for runtime access
    addPlugin(resolver.resolve('./runtime/plugin.mjs'))
  }
})
