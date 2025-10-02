// ---------- Node.js Templates ----------
const templatesNode = {
  development: `# Application
NODE_ENV=development
APP_NAME=myapp
APP_PORT=3000
APP_URL=http://localhost:3000
DEBUG=true
LOG_LEVEL=debug

# Database (PostgreSQL example)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=myapp_dev

# Authentication
JWT_SECRET=dev_jwt_secret_change_in_production
JWT_EXPIRATION=7d
SESSION_SECRET=dev_session_secret

# API & CORS
API_VERSION=v1
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_MAX=100

# Email (Development - using Mailtrap or similar)
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=noreply@example.com
MAIL_SECURE=false

# Redis (Optional - for caching/sessions)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# AWS S3 (Optional - for file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET=mybucket-dev
`,

  production: `# Application
NODE_ENV=production
APP_NAME=myapp
APP_PORT=8080
APP_URL=https://example.com
DEBUG=false
LOG_LEVEL=error

# Database (PostgreSQL)
DB_HOST=prod-db.example.com
DB_PORT=5432
DB_USER=prod_user
DB_PASSWORD=CHANGE_THIS_SECURE_PASSWORD
DB_NAME=myapp
DB_SSL=true

# Authentication
JWT_SECRET=CHANGE_THIS_SECURE_JWT_SECRET
JWT_EXPIRATION=7d
SESSION_SECRET=CHANGE_THIS_SECURE_SESSION_SECRET

# API & CORS
API_VERSION=v1
CORS_ORIGIN=https://example.com
RATE_LIMIT_MAX=60

# Email (Production - using real SMTP)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=user@example.com
MAIL_PASSWORD=CHANGE_THIS
MAIL_FROM=noreply@example.com
MAIL_SECURE=true

# Redis
REDIS_HOST=prod-redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=CHANGE_THIS

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=CHANGE_THIS
AWS_SECRET_ACCESS_KEY=CHANGE_THIS
AWS_BUCKET=mybucket-prod
`,

  test: `# Application
NODE_ENV=test
APP_NAME=myapp-test
APP_PORT=5000
APP_URL=http://localhost:5000
DEBUG=true
LOG_LEVEL=silent

# Database (In-memory or test DB)
DB_HOST=localhost
DB_PORT=5432
DB_USER=test_user
DB_PASSWORD=test_password
DB_NAME=myapp_test

# Authentication (Test values)
JWT_SECRET=test_jwt_secret
JWT_EXPIRATION=1h
SESSION_SECRET=test_session_secret

# API & CORS
API_VERSION=v1
CORS_ORIGIN=*
RATE_LIMIT_MAX=1000
`,
};

// ---------- Vite (Vue3/React) Templates ----------
// Only expose safe variables to client with VITE_ prefix
// Backend secrets stay without prefix (not exposed to client)
const templatesVite = {
  development: `# Vite Mode
NODE_ENV=development

# Public variables (exposed to client via import.meta.env)
VITE_APP_TITLE=My Vue App
VITE_API_URL=http://localhost:3000/api
VITE_API_VERSION=v1
VITE_ENABLE_MOCK=true
VITE_GA_ID=

# Backend variables (NOT exposed to client)
# These are for SSR or build-time only
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=myapp_dev

JWT_SECRET=dev_jwt_secret
SESSION_SECRET=dev_session_secret

MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=
MAIL_PASSWORD=
`,

  production: `# Vite Mode
NODE_ENV=production

# Public variables (exposed to client via import.meta.env)
VITE_APP_TITLE=My Vue App
VITE_API_URL=https://api.example.com
VITE_API_VERSION=v1
VITE_ENABLE_MOCK=false
VITE_GA_ID=G-XXXXXXXXXX

# Backend variables (NOT exposed to client)
# These are for SSR or build-time only
DB_HOST=prod-db.example.com
DB_PORT=5432
DB_USER=prod_user
DB_PASSWORD=CHANGE_THIS_SECURE_PASSWORD
DB_NAME=myapp
DB_SSL=true

JWT_SECRET=CHANGE_THIS_SECURE_JWT_SECRET
SESSION_SECRET=CHANGE_THIS_SECURE_SESSION_SECRET

MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=user@example.com
MAIL_PASSWORD=CHANGE_THIS
`,

  test: `# Vite Mode
NODE_ENV=test

# Public variables (exposed to client via import.meta.env)
VITE_APP_TITLE=My Vue App (Test)
VITE_API_URL=http://localhost:5000/api
VITE_API_VERSION=v1
VITE_ENABLE_MOCK=true
VITE_GA_ID=

# Backend variables (NOT exposed to client)
DB_HOST=localhost
DB_PORT=5432
DB_USER=test_user
DB_PASSWORD=test_password
DB_NAME=myapp_test

JWT_SECRET=test_jwt_secret
SESSION_SECRET=test_session_secret
`,
};

module.exports = { templatesNode, templatesVite };
