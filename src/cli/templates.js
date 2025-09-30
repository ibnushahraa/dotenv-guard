// ---------- Node.js Templates ----------
const templatesNode = {
  development: `APP_ENV=development
APP_NAME=myapp
APP_PORT=3000
DEBUG=true

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=myapp_dev

JWT_SECRET=dev_secret
SESSION_LIFETIME=3600

MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=
MAIL_PASS=
MAIL_FROM=noreply@example.com

AWS_ACCESS_KEY=
AWS_SECRET_KEY=
AWS_BUCKET=mybucket-dev

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASS=
`,
  staging: `APP_ENV=staging
APP_NAME=myapp
APP_PORT=4000
DEBUG=false

DB_HOST=staging-db.example.com
DB_PORT=3306
DB_USER=staging_user
DB_PASS=staging_pass
DB_NAME=myapp_staging

JWT_SECRET=staging_secret
SESSION_LIFETIME=3600

MAIL_HOST=smtp.staging.example.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM=noreply-staging@example.com

AWS_ACCESS_KEY=
AWS_SECRET_KEY=
AWS_BUCKET=mybucket-staging

REDIS_HOST=staging-redis.example.com
REDIS_PORT=6379
REDIS_PASS=
`,
  production: `APP_ENV=production
APP_NAME=myapp
APP_PORT=8080
DEBUG=false

DB_HOST=prod-db.example.com
DB_PORT=3306
DB_USER=prod_user
DB_PASS=secure_pass
DB_NAME=myapp

JWT_SECRET=prod_secret
SESSION_LIFETIME=3600

MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM=noreply@example.com

AWS_ACCESS_KEY=
AWS_SECRET_KEY=
AWS_BUCKET=mybucket

REDIS_HOST=prod-redis.example.com
REDIS_PORT=6379
REDIS_PASS=
`,
  test: `APP_ENV=test
APP_NAME=myapp
APP_PORT=5000
DEBUG=true

DB_HOST=localhost
DB_PORT=3306
DB_USER=test_user
DB_PASS=test_pass
DB_NAME=myapp_test

JWT_SECRET=test_secret
SESSION_LIFETIME=3600
`,
  qa: `APP_ENV=qa
APP_NAME=myapp
APP_PORT=6000
DEBUG=false

DB_HOST=qa-db.example.com
DB_PORT=3306
DB_USER=qa_user
DB_PASS=qa_pass
DB_NAME=myapp_qa

JWT_SECRET=qa_secret
SESSION_LIFETIME=3600
`,
  preview: `APP_ENV=preview
APP_NAME=myapp
APP_PORT=7000
DEBUG=false

DB_HOST=preview-db.example.com
DB_PORT=3306
DB_USER=preview_user
DB_PASS=preview_pass
DB_NAME=myapp_preview

JWT_SECRET=preview_secret
SESSION_LIFETIME=3600
`,
};

// ---------- Vite Templates (auto prefix VITE_) ----------
const templatesVite = {};
for (const [env, content] of Object.entries(templatesNode)) {
  templatesVite[env] = content
    .split("\n")
    .map((line) => {
      if (line && !line.startsWith("#") && line.includes("=")) {
        const [k, v] = line.split("=");
        return `VITE_${k}=${v}`;
      }
      return line;
    })
    .join("\n");
}

module.exports = { templatesNode, templatesVite };
