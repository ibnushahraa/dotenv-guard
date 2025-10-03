// Example 4: Vite project - RECOMMENDED: Use vite-plugin instead
import { config } from '../src/index.mjs';

console.log('=== Example 4: Core Package Usage (Not Recommended for Vite) ===');
console.log('For Vite projects, use @ibnushahraa/vite-plugin-dotenv-guard instead!\n');

// Core package - basic usage (not ideal for Vite)
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';

config({
  path: envFile,
  validator: true
});

console.log(`Loaded: ${envFile}`);
console.log('Environment variables available in process.env\n');

// RECOMMENDED: For actual Vite projects, use the plugin:
/*
// vite.config.js
import { defineConfig } from 'vite';
import dotenvGuard from '@ibnushahraa/vite-plugin-dotenv-guard';

export default defineConfig({
  plugins: [
    dotenvGuard({
      // Auto-detects .env.{mode} based on Vite mode
      // Encryption always enabled (auto-decrypt)
      validator: true,
      schema: 'env.schema.json'
    })
  ]
});
*/

// Backend setup (Node.js/Express/NestJS):
/*
import { config } from '@ibnushahraa/dotenv-guard';

// Load environment-specific file
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';

config({
  path: envFile,
  validator: true
});
*/

console.log('💡 Tip: For Vite, use @ibnushahraa/vite-plugin-dotenv-guard');
