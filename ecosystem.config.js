// ecosystem.config.js
// PM2 production config for the BMPT Solutions website + CMS.
//
// Usage:
//   pm2 start ecosystem.config.js --env production
//   pm2 reload ecosystem.config.js --env production --update-env
//   pm2 save
//
// Build first:
//   npm ci && npm run build

module.exports = {
  apps: [
    {
      // ── Identity ──────────────────────────────────────────
      name:   "bmptsolutions-website",
      cwd: "/var/www/bmpt",
      script: "node_modules/next/dist/bin/next",
      args:   "start -p 4005",

      // ── Clustering & performance ─────────────────────────
      // Marketing + CMS in one app. Start with 2 instances; scale
      // out via `instances: "max"` if traffic warrants it.
      instances:   1,
      exec_mode:   "cluster",

      // ── Auto-restart & resilience ────────────────────────
      autorestart:               true,
      watch:                     false,
      max_memory_restart:        "768M",
      min_uptime:                "30s",
      max_restarts:              10,
      restart_delay:             4000,
      exp_backoff_restart_delay: 100,
      kill_timeout:              5000,
      listen_timeout:            10000,
      wait_ready:                false,

      // ── Logging ──────────────────────────────────────────
      out_file:        "/root/.pm2/logs/bmptsolutions-website-out.log",
      error_file:      "/root/.pm2/logs/bmptsolutions-website-error.log",
      merge_logs:      true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      time:            true,

      // ── Environment ──────────────────────────────────────
      // Secrets (DATABASE_URL, REDIS_URL, NEXTAUTH_SECRET, AWS_*) come
      // from the .env file Next.js loads automatically — don't repeat
      // them here. Only the values PM2 itself needs to set on the
      // process belong below.
      env: {
        NODE_ENV: "production",
        PORT:     "4005",
      },
      env_production: {
        NODE_ENV: "production",
        PORT:     "4005",
        // NEXT_TELEMETRY_DISABLED: "1",
      },
    },
  ],
};
