// Example 4: Vite project configuration with multi-env support
import { config } from '../src/index.mjs';

console.log('=== Example 4: Vite Multi-Environment Configuration ===');

// NEW: Multi-env mode - automatically loads multiple .env files based on NODE_ENV
// Priority: .env → .env.local → .env.[mode] → .env.[mode].local
config({
  multiEnv: true,           // Enable multi-env mode
  mode: 'development',      // Or get from: process.env.NODE_ENV
  enc: false,              // Keep plaintext for Vite compatibility
  validator: true          // Validate with env.schema.json or env.schema.[mode].json
});

// Example vite.config.js with multi-env:
/*
import { defineConfig } from 'vite';
import { config } from '@ibnushahraa/dotenv-guard';

// Load multiple .env files automatically
config({
  multiEnv: true,
  mode: process.env.NODE_ENV || 'development',
  enc: false,
  validator: true
});

export default defineConfig({
  // your vite config here
});
*/

// OLD way (single file) - still supported for backward compatibility:
/*
config({
  path: '.env.development',  // Manual file selection
  enc: false,
  validator: true
});
*/

console.log('\nMulti-environment files loaded for mode:', process.env.NODE_ENV || 'development');
console.log('Files checked: .env, .env.local, .env.[mode], .env.[mode].local');
