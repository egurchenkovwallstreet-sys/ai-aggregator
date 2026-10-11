/** PM2: процесс Next.js на стенде. Секреты только в .env на сервере. */
module.exports = {
  apps: [
    {
      name: "ai-aggregator",
      cwd: process.env.DEPLOY_DIR || "/var/www/ai-aggregator",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
