// Example 2: With schema validation
const { config } = require('../src/index');

console.log('=== Example 2: With Schema Validation ===');

// This will validate against env.schema.json
config({
  validator: true
});

console.log('Environment variables validated and loaded:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

console.log('\nNote: If validation fails, the app will exit with code 1');
