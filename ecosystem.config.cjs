// 🤖 [IA] - PM2 Configuration for CashGuard Paradise
// Generado automáticamente para desarrollo local

module.exports = {
  apps: [
    {
      name: 'cashguard-dev',
      script: 'npm',
      args: 'run dev -- --host 0.0.0.0',
      cwd: '/Users/samuelers/Paradise System Labs/cashguard-paradise',
      env: {
        NODE_ENV: 'development',
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 1000,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
