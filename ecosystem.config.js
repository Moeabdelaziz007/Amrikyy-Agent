/**
 * PM2 Ecosystem Configuration
 *
 * Docker Alternative for Mac - Process Management
 *
 * Commands:
 *   pm2 start ecosystem.config.js            # Start all
 *   pm2 start ecosystem.config.js --only backend-prod  # Start specific
 *   pm2 stop all                             # Stop all
 *   pm2 restart all                          # Restart all
 *   pm2 reload all                           # Zero-downtime restart
 *   pm2 logs                                 # View logs
 *   pm2 monit                                # Monitor
 *   pm2 save                                 # Save config
 *   pm2 startup                              # Auto-start on boot
 */

module.exports = {
  apps: [
    // ========================================
    // PRODUCTION ENVIRONMENT
    // ========================================
    {
      name: 'amrikyy-backend-prod',
      cwd: './backend',
      script: 'server.js',
      instances: 2, // Run 2 instances for load balancing
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './logs/backend-prod-error.log',
      out_file: './logs/backend-prod-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
    },
    {
      name: 'amrikyy-frontend-prod',
      cwd: './frontend',
      script: 'npm',
      args: 'run preview', // Vite preview mode
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/frontend-prod-error.log',
      out_file: './logs/frontend-prod-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '300M',
      autorestart: true,
      watch: false,
    },

    // ========================================
    // STAGING ENVIRONMENT
    // ========================================
    {
      name: 'amrikyy-backend-staging',
      cwd: './backend',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'staging',
        PORT: 5001,
      },
      error_file: './logs/backend-staging-error.log',
      out_file: './logs/backend-staging-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
    },
    {
      name: 'amrikyy-frontend-staging',
      cwd: './frontend',
      script: 'npm',
      args: 'run preview',
      env: {
        NODE_ENV: 'staging',
        PORT: 3001,
      },
      error_file: './logs/frontend-staging-error.log',
      out_file: './logs/frontend-staging-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '300M',
      autorestart: true,
      watch: false,
    },

    // ========================================
    // DEVELOPMENT ENVIRONMENT
    // ========================================
    {
      name: 'amrikyy-backend-dev',
      cwd: './backend',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 5002,
      },
      error_file: './logs/backend-dev-error.log',
      out_file: './logs/backend-dev-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M',
      autorestart: true,
      watch: true, // Auto-restart on file changes
      ignore_watch: ['node_modules', 'logs', 'coverage', 'dist'],
      watch_delay: 1000,
      min_uptime: '5s',
    },
    {
      name: 'amrikyy-frontend-dev',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3002,
      },
      error_file: './logs/frontend-dev-error.log',
      out_file: './logs/frontend-dev-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '300M',
      autorestart: true,
      watch: false, // Vite has its own hot reload
    },

    // ========================================
    // REDIS (Optional - if running locally)
    // ========================================
    // Uncomment if you want PM2 to manage Redis
    // {
    //   name: 'redis',
    //   script: 'redis-server',
    //   autorestart: true,
    //   watch: false,
    // },
  ],

  // ========================================
  // DEPLOYMENT CONFIGURATION
  // ========================================
  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/maya-travel-agent.git',
      path: '/var/www/production',
      'pre-deploy-local': '',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
    staging: {
      user: 'node',
      host: 'staging-server.com',
      ref: 'origin/develop',
      repo: 'git@github.com:yourusername/maya-travel-agent.git',
      path: '/var/www/staging',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env staging',
    },
  },
};
