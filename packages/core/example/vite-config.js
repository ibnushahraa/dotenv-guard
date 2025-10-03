// Example 4: Vite project configuration with multi-env support
import { config } from '../src/index.mjs';

console.log('=== Example 4: Vite Multi-Environment Configuration ===');

// NOTE: For Vite projects, use @ibnushahraa/vite-plugin-dotenv-guard instead
// This example shows core package usage in Node.js context

// Multi-env mode - automatically loads multiple .env files based on NODE_ENV
// Priority: .env → .env.local → .env.[mode] → .env.[mode].local
config({
  multiEnv: true,           // Enable multi-env mode
  mode: 'development',      // Or get from: process.env.NODE_ENV
  validator: true           // Validate with env.schema.json or env.schema.[mode].json
});

// For actual Vite projects, use the plugin instead:
/*
// vite.config.js
import { defineConfig } from 'vite';
import dotenvGuard from '@ibnushahraa/vite-plugin-dotenv-guard';

export default defineConfig({
  plugins: [
    dotenvGuard({
      encryption: true,           // Auto-decrypt encrypted values
      encConfig: 'env.enc.json',  // Selective encryption config
      validator: true,            // Enable schema validation
      schema: 'env.schema.json'   // Schema file path
    })
  ]
});
*/

// Backend setup with encryption (Node.js/Express/NestJS):
/*
import { config } from '@ibnushahraa/dotenv-guard';

config({
  multiEnv: true,
  mode: process.env.NODE_ENV || 'development'
  // Encryption auto-enabled, decrypts values starting with 'aes:'
});
*/

console.log('\nMulti-environment files loaded for mode:', process.env.NODE_ENV || 'development');
console.log('Files checked: .env, .env.local, .env.[mode], .env.[mode].local');
console.log('\nFor Vite projects: Use @ibnushahraa/vite-plugin-dotenv-guard');
