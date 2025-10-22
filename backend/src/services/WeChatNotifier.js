/**
 * WeChatNotifier - 微信消息推送服务 (Server酱)
 * 
 * 功能：
 * - 系统健康告警推送到微信
 * - API 故障通知
 * - 性能问题提醒
 * - 支持 Markdown 格式
 * 
 * @author Ona AI
 * @created 2025-01-25
 */

const axios = require('axios');

class WeChatNotifier {
  constructor(options = {}) {
    this.serverChanKey = options.serverChanKey || process.env.SERVER_CHAN_KEY;
    this.enabled = !!this.serverChanKey;
    this.apiUrl = `https://sctapi.ftqq.com/${this.serverChanKey}.send`;
  }

  /**
   * 发送微信消息
   */
  async send(title, content, options = {}) {
    if (!this.enabled) {
      console.warn('⚠️  Server酱未配置，跳过微信推送');
      return { success: false, error: 'Server酱未配置' };
    }

    try {
      const response = await axios.post(this.apiUrl, {
        title: title,
        desp: content,
        ...options
      });

      if (response.data.code === 0) {
        console.log('✅ 微信消息推送成功');
        return { success: true, data: response.data };
      } else {
        console.error('❌ 微信消息推送失败:', response.data.message);
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('❌ 微信消息推送异常:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送健康检查告警
   */
  async sendHealthAlert(status) {
    const unhealthyServices = Object.entries(status.services)
      .filter(([_, service]) => service.status !== 'healthy')
      .map(([name, service]) => `- **${name}**: ${service.status} (${service.message || '无详情'})`);

    if (unhealthyServices.length === 0) {
      return { success: true, message: '所有服务正常，无需告警' };
    }

    const title = `🚨 系统健康告警 - ${unhealthyServices.length} 个服务异常`;
    const content = `
## 系统状态概览

**总体状态**: ${status.status}  
**检查时间**: ${new Date(status.timestamp).toLocaleString('zh-CN')}  
**运行时长**: ${Math.floor(status.uptime / 3600)}小时

## 异常服务列表

${unhealthyServices.join('\n')}

## 系统指标

- **内存使用**: ${(status.memory.usedMemoryMB / status.memory.totalMemoryMB * 100).toFixed(1)}%
- **CPU 负载**: ${status.cpu.loadAverage[0].toFixed(2)}
- **活跃连接**: ${status.activeConnections || 0}

---
*来自 Amrikyy Agent 健康监控系统*
    `.trim();

    return this.send(title, content);
  }

  /**
   * 发送 API 故障通知
   */
  async sendAPIFailure(apiName, error) {
    const title = `⚠️  API 故障 - ${apiName}`;
    const content = `
## API 故障详情

**API 名称**: ${apiName}  
**故障时间**: ${new Date().toLocaleString('zh-CN')}  
**错误信息**: ${error.message || error}

## 建议操作

1. 检查 API 密钥是否有效
2. 验证网络连接
3. 查看 API 服务状态
4. 检查请求限制

---
*来自 Amrikyy Agent 监控系统*
    `.trim();

    return this.send(title, content);
  }

  /**
   * 发送性能告警
   */
  async sendPerformanceAlert(metric, value, threshold) {
    const title = `📊 性能告警 - ${metric} 超过阈值`;
    const content = `
## 性能指标异常

**指标名称**: ${metric}  
**当前值**: ${value}  
**阈值**: ${threshold}  
**告警时间**: ${new Date().toLocaleString('zh-CN')}

## 建议操作

- 检查系统资源使用情况
- 优化数据库查询
- 清理缓存
- 考虑扩容

---
*来自 Amrikyy Agent 性能监控*
    `.trim();

    return this.send(title, content);
  }

  /**
   * 发送部署通知
   */
  async sendDeploymentNotification(version, changes) {
    const title = `🚀 新版本部署 - v${version}`;
    const content = `
## 部署信息

**版本号**: ${version}  
**部署时间**: ${new Date().toLocaleString('zh-CN')}

## 更新内容

${changes.map(change => `- ${change}`).join('\n')}

---
*来自 Amrikyy Agent 部署系统*
    `.trim();

    return this.send(title, content);
  }

  /**
   * 发送每日报告
   */
  async sendDailyReport(stats) {
    const title = `📈 每日系统报告 - ${new Date().toLocaleDateString('zh-CN')}`;
    const content = `
## 系统运行概况

**报告日期**: ${new Date().toLocaleDateString('zh-CN')}

### API 调用统计
- **总请求数**: ${stats.totalRequests || 0}
- **成功率**: ${stats.successRate || 0}%
- **平均响应时间**: ${stats.avgResponseTime || 0}ms

### 用户活动
- **活跃用户**: ${stats.activeUsers || 0}
- **新增用户**: ${stats.newUsers || 0}
- **总用户数**: ${stats.totalUsers || 0}

### 系统健康
- **正常运行时间**: ${stats.uptime || 0}小时
- **故障次数**: ${stats.failures || 0}
- **平均 CPU**: ${stats.avgCPU || 0}%
- **平均内存**: ${stats.avgMemory || 0}%

---
*来自 Amrikyy Agent 自动报告系统*
    `.trim();

    return this.send(title, content);
  }

  /**
   * 测试连接
   */
  async testConnection() {
    return this.send(
      '✅ Server酱连接测试',
      '这是一条测试消息，如果您收到此消息，说明微信推送配置成功！\n\n---\n*来自 Amrikyy Agent*'
    );
  }
}

module.exports = WeChatNotifier;
