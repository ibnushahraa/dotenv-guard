// Example 1: Basic usage (like dotenv)
const { config } = require('../src/index');

console.log('=== Example 1: Basic Usage ===');
config();

console.log('Environment variables loaded:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
