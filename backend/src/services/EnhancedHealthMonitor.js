/**
 * EnhancedHealthMonitor - 增强版健康监控 (集成中文工具)
 * 
 * 功能：
 * - 系统健康检查
 * - 微信告警推送 (Server酱)
 * - 性能指标监控
 * - 自动化告警规则
 * 
 * @author Ona AI
 * @created 2025-01-25
 */

const WeChatNotifier = require('./WeChatNotifier');
const os = require('os');

class EnhancedHealthMonitor {
  constructor(options = {}) {
    this.wechat = new WeChatNotifier(options);
    this.checkInterval = options.checkInterval || 60000; // 1分钟
    this.alertThresholds = {
      memory: options.memoryThreshold || 85, // 85%
      cpu: options.cpuThreshold || 80, // 80%
      responseTime: options.responseTimeThreshold || 5000, // 5秒
    };
    
    this.services = new Map();
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTimes: [],
    };
    
    this.lastAlertTime = new Map();
    this.alertCooldown = 300000; // 5分钟冷却期
  }

  /**
   * 注册服务检查
   */
  registerService(name, checkFunction) {
    this.services.set(name, {
      name,
      check: checkFunction,
      status: 'unknown',
      lastCheck: null,
      lastError: null,
    });
  }

  /**
   * 检查所有服务
   */
  async checkAllServices() {
    const results = {};
    
    for (const [name, service] of this.services.entries()) {
      try {
        const startTime = Date.now();
        const result = await service.check();
        const responseTime = Date.now() - startTime;
        
        service.status = result.healthy ? 'healthy' : 'unhealthy';
        service.lastCheck = new Date().toISOString();
        service.lastError = result.error || null;
        service.responseTime = responseTime;
        
        results[name] = {
          status: service.status,
          responseTime,
          message: result.message || '',
          lastCheck: service.lastCheck,
        };
        
        // 检查响应时间告警
        if (responseTime > this.alertThresholds.responseTime) {
          await this.sendAlert('performance', {
            metric: `${name} 响应时间`,
            value: `${responseTime}ms`,
            threshold: `${this.alertThresholds.responseTime}ms`,
          });
        }
      } catch (error) {
        service.status = 'error';
        service.lastError = error.message;
        results[name] = {
          status: 'error',
          message: error.message,
          lastCheck: new Date().toISOString(),
        };
        
        // 发送服务故障告警
        await this.sendAlert('service', {
          serviceName: name,
          error: error.message,
        });
      }
    }
    
    return results;
  }

  /**
   * 获取系统指标
   */
  getSystemMetrics() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = (usedMem / totalMem) * 100;
    
    const cpuLoad = os.loadavg()[0];
    const cpuCount = os.cpus().length;
    const cpuUsage = (cpuLoad / cpuCount) * 100;
    
    return {
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percentage: memoryUsage.toFixed(2),
      },
      cpu: {
        load: cpuLoad,
        cores: cpuCount,
        percentage: cpuUsage.toFixed(2),
      },
      uptime: os.uptime(),
      platform: os.platform(),
      hostname: os.hostname(),
    };
  }

  /**
   * 检查系统资源告警
   */
  async checkResourceAlerts() {
    const metrics = this.getSystemMetrics();
    
    // 内存告警
    if (parseFloat(metrics.memory.percentage) > this.alertThresholds.memory) {
      await this.sendAlert('performance', {
        metric: '内存使用率',
        value: `${metrics.memory.percentage}%`,
        threshold: `${this.alertThresholds.memory}%`,
      });
    }
    
    // CPU 告警
    if (parseFloat(metrics.cpu.percentage) > this.alertThresholds.cpu) {
      await this.sendAlert('performance', {
        metric: 'CPU 使用率',
        value: `${metrics.cpu.percentage}%`,
        threshold: `${this.alertThresholds.cpu}%`,
      });
    }
  }

  /**
   * 发送告警 (带冷却期)
   */
  async sendAlert(type, data) {
    const alertKey = `${type}:${JSON.stringify(data)}`;
    const now = Date.now();
    const lastAlert = this.lastAlertTime.get(alertKey);
    
    // 检查冷却期
    if (lastAlert && (now - lastAlert) < this.alertCooldown) {
      console.log(`⏳ 告警冷却中，跳过: ${alertKey}`);
      return;
    }
    
    this.lastAlertTime.set(alertKey, now);
    
    switch (type) {
      case 'service':
        await this.wechat.sendAPIFailure(data.serviceName, { message: data.error });
        break;
      case 'performance':
        await this.wechat.sendPerformanceAlert(data.metric, data.value, data.threshold);
        break;
      case 'health':
        await this.wechat.sendHealthAlert(data);
        break;
    }
  }

  /**
   * 获取完整健康状态
   */
  async getHealthStatus() {
    const services = await this.checkAllServices();
    const metrics = this.getSystemMetrics();
    
    const unhealthyCount = Object.values(services).filter(
      s => s.status !== 'healthy'
    ).length;
    
    const overallStatus = unhealthyCount === 0 ? 'healthy' : 
                         unhealthyCount < Object.keys(services).length / 2 ? 'degraded' : 
                         'unhealthy';
    
    const status = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
      metrics,
      uptime: process.uptime(),
      memory: {
        usedMemoryMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
        totalMemoryMB: (os.totalmem() / 1024 / 1024).toFixed(2),
      },
      cpu: {
        loadAverage: os.loadavg(),
      },
    };
    
    // 如果状态不健康，发送告警
    if (overallStatus !== 'healthy') {
      await this.sendAlert('health', status);
    }
    
    return status;
  }

  /**
   * 启动定期检查
   */
  startMonitoring() {
    console.log('🚀 启动健康监控系统...');
    
    // 立即执行一次检查
    this.getHealthStatus();
    
    // 定期检查
    this.monitoringInterval = setInterval(async () => {
      await this.getHealthStatus();
      await this.checkResourceAlerts();
    }, this.checkInterval);
    
    console.log(`✅ 健康监控已启动 (间隔: ${this.checkInterval / 1000}秒)`);
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      console.log('⏹️  健康监控已停止');
    }
  }

  /**
   * 记录请求指标
   */
  recordRequest(success, responseTime) {
    this.metrics.requests++;
    if (!success) this.metrics.errors++;
    this.metrics.responseTimes.push(responseTime);
    
    // 只保留最近1000个响应时间
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift();
    }
  }

  /**
   * 获取统计数据
   */
  getStats() {
    const avgResponseTime = this.metrics.responseTimes.length > 0
      ? this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length
      : 0;
    
    const successRate = this.metrics.requests > 0
      ? ((this.metrics.requests - this.metrics.errors) / this.metrics.requests * 100).toFixed(2)
      : 100;
    
    return {
      totalRequests: this.metrics.requests,
      totalErrors: this.metrics.errors,
      successRate: `${successRate}%`,
      avgResponseTime: `${avgResponseTime.toFixed(2)}ms`,
    };
  }

  /**
   * 发送每日报告
   */
  async sendDailyReport() {
    const status = await this.getHealthStatus();
    const stats = this.getStats();
    
    await this.wechat.sendDailyReport({
      ...stats,
      uptime: (status.uptime / 3600).toFixed(2),
      avgCPU: status.metrics.cpu.percentage,
      avgMemory: status.metrics.memory.percentage,
      failures: this.metrics.errors,
    });
  }

  /**
   * 测试微信推送
   */
  async testWeChatNotification() {
    return this.wechat.testConnection();
  }
}

module.exports = EnhancedHealthMonitor;
