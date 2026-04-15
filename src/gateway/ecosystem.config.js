// Load .env with override to ensure we use the correct token
require('dotenv').config({ override: true });

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('ERROR: TELEGRAM_BOT_TOKEN is not set in .env file');
  process.exit(1);
}

const botId = token.split(':')[0];
console.log(`PM2 Config: Using bot token for bot ID ${botId}`);

// Validate token format (basic check)
if (!token.includes(':') || botId.length < 5) {
  console.error('ERROR: TELEGRAM_BOT_TOKEN appears malformed');
  process.exit(1);
}

module.exports = {
  apps: [{
    name: 'stuur-gateway',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info',
      TELEGRAM_BOT_TOKEN: token // Explicitly set from .env
    },
    env_development: {
      NODE_ENV: 'development',
      LOG_LEVEL: 'debug',
      TELEGRAM_BOT_TOKEN: token
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    kill_timeout: 5000,
    listen_timeout: 5000,
    shutdown_with_message: true,
    max_restarts: 10,
    restart_delay: 5000,
    // PM2 will auto-restart on crash (default behavior)
    // Add additional monitoring
    min_uptime: '10s',
    stop_exit_codes: [0],
    exp_backoff_restart_delay_ms: 100
  }]
};