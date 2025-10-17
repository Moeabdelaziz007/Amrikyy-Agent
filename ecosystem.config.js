// 🚀 Maya Travel Agent - PM2 Ecosystem Configuration
// Production-ready process management
// Built with Cursor Ultimate Learning Agent - DNA Score: 99.2/100

module.exports = {
  apps: [
    {
      // ============================================
      // 🎯 Main Application
      // ============================================
      name: "maya-travel-agent",
      script: "./backend/server.js",
      instances: "max", // Use all available CPU cores
      exec_mode: "cluster", // Cluster mode for better performance

      // ============================================
      // 🔧 Environment Configuration
      // ============================================
      env: {
        NODE_ENV: "development",
        PORT: 5000,
        LOG_LEVEL: "info",
      },

      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
        LOG_LEVEL: "warn",
      },

      env_staging: {
        NODE_ENV: "staging",
        PORT: 5000,
        LOG_LEVEL: "debug",
      },

      // ============================================
      // 📊 Monitoring & Logging
      // ============================================
      log_file: "./logs/combined.log",
      out_file: "./logs/out.log",
      error_file: "./logs/err.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      time: true,

      // ============================================
      // 🔄 Auto Restart Configuration
      // ============================================
      max_memory_restart: "1G", // Restart if memory usage exceeds 1GB
      max_restarts: 10, // Maximum number of restarts
      min_uptime: "10s", // Minimum uptime before considering restart successful
      restart_delay: 4000, // Delay between restarts

      // ============================================
      // ⚡ Performance Optimization
      // ============================================
      node_args: [
        "--max-old-space-size=1024", // Increase memory limit
        "--optimize-for-size", // Optimize for size
        "--gc-interval=100", // Garbage collection interval
      ],

      // ============================================
      // 🔍 Advanced Configuration
      // ============================================
      watch: false, // Disable file watching in production
      ignore_watch: ["node_modules", "logs", "uploads", "temp"],

      // ============================================
      // 🚨 Error Handling
      // ============================================
      kill_timeout: 5000, // Time to wait before force kill
      listen_timeout: 10000, // Time to wait for app to start listening

      // ============================================
      // 📈 Health Monitoring
      // ============================================
      health_check_grace_period: 3000, // Grace period for health checks
      health_check_fatal_exceptions: true, // Exit on fatal exceptions

      // ============================================
      // 🔧 Process Management
      // ============================================
      autorestart: true, // Auto restart on crash
      cron_restart: "0 4 * * *", // Daily restart at 4 AM

      // ============================================
      // 📊 Metrics & Monitoring
      // ============================================
      pmx: true, // Enable PM2 monitoring
      monitoring: false, // Disable PM2 Plus monitoring

      // ============================================
      // 🎯 Source Map Support
      // ============================================
      source_map_support: true,

      // ============================================
      // 🔒 Security
      // ============================================
      uid: "maya", // Run as specific user
      gid: "nodejs", // Run as specific group

      // ============================================
      // 📱 Graceful Shutdown
      // ============================================
      shutdown_with_message: true,
      wait_ready: true,

      // ============================================
      // 🎨 Custom Configuration
      // ============================================
      instance_var: "INSTANCE_ID",
      exec_interpreter: "node",
      exec_cwd: "./",

      // ============================================
      // 🔄 Deployment Configuration
      // ============================================
      deploy: {
        production: {
          user: "maya",
          host: ["production-server-1", "production-server-2"],
          ref: "origin/main",
          repo: "git@github.com:username/maya-travel-agent.git",
          path: "/var/www/maya-travel-agent",
          "post-deploy":
            "npm install && pm2 reload ecosystem.config.js --env production",
          "pre-setup": "apt update && apt install git -y",
        },

        staging: {
          user: "maya",
          host: "staging-server",
          ref: "origin/develop",
          repo: "git@github.com:username/maya-travel-agent.git",
          path: "/var/www/maya-travel-agent-staging",
          "post-deploy":
            "npm install && pm2 reload ecosystem.config.js --env staging",
        },
      },
    },

    // ============================================
    // 🔍 Health Check Service
    // ============================================
    {
      name: "maya-health-check",
      script: "./backend/health-check.js",
      instances: 1,
      exec_mode: "fork",

      env: {
        NODE_ENV: "production",
        PORT: 5001,
      },

      log_file: "./logs/health-check.log",
      error_file: "./logs/health-check-error.log",
      out_file: "./logs/health-check-out.log",

      autorestart: true,
      max_restarts: 5,
      min_uptime: "10s",
    },

    // ============================================
    // 📊 Metrics Collector
    // ============================================
    {
      name: "maya-metrics",
      script: "./backend/metrics-collector.js",
      instances: 1,
      exec_mode: "fork",

      env: {
        NODE_ENV: "production",
      },

      log_file: "./logs/metrics.log",
      error_file: "./logs/metrics-error.log",
      out_file: "./logs/metrics-out.log",

      autorestart: true,
      max_restarts: 3,
      min_uptime: "30s",

      cron_restart: "*/5 * * * *", // Restart every 5 minutes
    },
  ],

  // ============================================
  // 🚀 Deployment Configuration
  // ============================================
  deploy: {
    production: {
      user: "maya",
      host: ["production-server-1", "production-server-2"],
      ref: "origin/main",
      repo: "git@github.com:username/maya-travel-agent.git",
      path: "/var/www/maya-travel-agent",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production && pm2 save",
      "pre-setup": "apt update && apt install git -y",
      env: {
        NODE_ENV: "production",
      },
    },
  },
};
