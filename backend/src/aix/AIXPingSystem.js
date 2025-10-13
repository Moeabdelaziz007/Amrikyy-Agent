/**
 * AIX3 Ping System - نظام إشعارات متعدد المستويات
 * Created by Cursor - AIX Integration Team
 * 
 * نظام ping متقدم للتواصل الفوري مع الوكلاء
 * يدعم مستويات أولوية متعددة، تتبع الاستجابة، والعقوبات/المكافآت
 */

const { logger } = require('../utils/logger');

// إنشاء logger مخصص للـ Ping System
const log = logger.child('AIXPingSystem');

/**
 * مستويات أولوية الـ Ping
 */
const PingPriority = {
    INFO: 1,        // معلومات عامة - لا يوجد SLA
    LOW: 2,         // غير عاجل - SLA: 5 دقائق
    NORMAL: 3,      // عادي - SLA: 2 دقيقة
    HIGH: 4,        // مهم - SLA: 30 ثانية
    EMERGENCY: 5    // طارئ - SLA: 5 ثوانٍ
};

/**
 * حالات الوكيل
 */
const AgentStatus = {
    ONLINE: 'online',
    BUSY: 'busy',
    IDLE: 'idle',
    OFFLINE: 'offline',
    UNRESPONSIVE: 'unresponsive'
};

/**
 * جودة الاستجابة
 */
const ResponseQuality = {
    EXCELLENT: 5,   // استجابة فورية بجودة عالية
    GOOD: 4,        // استجابة في الوقت المناسب
    ACCEPTABLE: 3,  // استجابة متأخرة قليلاً
    POOR: 2,        // استجابة متأخرة
    FAILED: 1       // فشل في الاستجابة
};

/**
 * رسالة Ping
 */
class PingMessage {
    constructor({
        pingId,
        fromAgent,
        toAgent,
        priority,
        message,
        timestamp = Date.now(),
        deadline = null,
        requiresAction = false,
        context = {}
    }) {
        this.pingId = pingId;
        this.fromAgent = fromAgent;
        this.toAgent = toAgent;
        this.priority = priority;
        this.message = message;
        this.timestamp = timestamp;
        this.deadline = deadline || this._calculateDeadline();
        this.requiresAction = requiresAction;
        this.context = context;
    }

    _calculateDeadline() {
        const slaSeconds = {
            [PingPriority.INFO]: null,
            [PingPriority.LOW]: 300,      // 5 دقائق
            [PingPriority.NORMAL]: 120,   // 2 دقيقة
            [PingPriority.HIGH]: 30,      // 30 ثانية
            [PingPriority.EMERGENCY]: 5   // 5 ثوانٍ
        };

        const sla = slaSeconds[this.priority];
        return sla ? this.timestamp + (sla * 1000) : null;
    }

    toAIX3() {
        return {
            meta: {
                sender: this.fromAgent,
                recipient: this.toAgent,
                timestamp: new Date(this.timestamp).toISOString(),
                priority: this._getPriorityName(),
                type: 'ping_message',
                team: 'AIX Integration',
                version: 'AIX3'
            },
            content: {
                action: 'ping_request',
                ping_id: this.pingId,
                message: this.message,
                requires_action: this.requiresAction,
                deadline: this.deadline ? new Date(this.deadline).toISOString() : null,
                context: this.context
            }
        };
    }

    _getPriorityName() {
        const names = {
            [PingPriority.INFO]: 'INFO',
            [PingPriority.LOW]: 'LOW',
            [PingPriority.NORMAL]: 'NORMAL',
            [PingPriority.HIGH]: 'HIGH',
            [PingPriority.EMERGENCY]: 'EMERGENCY'
        };
        return names[this.priority];
    }
}

/**
 * استجابة للـ Ping
 */
class PingResponse {
    constructor({
        pingId,
        fromAgent,
        responseTime,
        status,
        message = null,
        quality = null
    }) {
        this.pingId = pingId;
        this.fromAgent = fromAgent;
        this.responseTime = responseTime;
        this.status = status;
        this.message = message;
        this.quality = quality;
    }

    toAIX3() {
        return {
            meta: {
                sender: this.fromAgent,
                ping_id: this.pingId,
                response_timestamp: new Date().toISOString(),
                status: this.status,
                team: 'AIX Integration',
                version: 'AIX3'
            },
            content: {
                action: 'ping_response',
                response_time: this.responseTime,
                quality: this.quality ? this._getQualityName() : null,
                message: this.message
            }
        };
    }

    _getQualityName() {
        const names = {
            [ResponseQuality.EXCELLENT]: 'EXCELLENT',
            [ResponseQuality.GOOD]: 'GOOD',
            [ResponseQuality.ACCEPTABLE]: 'ACCEPTABLE',
            [ResponseQuality.POOR]: 'POOR',
            [ResponseQuality.FAILED]: 'FAILED'
        };
        return names[this.quality];
    }
}

/**
 * مقاييس أداء الوكيل
 */
class AgentMetrics {
    constructor(agentId) {
        this.agentId = agentId;
        this.totalPings = 0;
        this.responded = 0;
        this.failed = 0;
        this.avgResponseTime = 0.0;
        this.reliabilityScore = 100.0;  // من 0 إلى 100
        this.currentStreak = 0;  // سلسلة الاستجابات الناجحة
        this.penalties = 0;
        this.rewards = 0;
        this.lastSeen = Date.now();
    }

    updateResponse(responseTime, quality) {
        this.responded++;
        this.lastSeen = Date.now();

        // تحديث متوسط وقت الاستجابة
        const totalResponses = this.responded;
        this.avgResponseTime = (
            (this.avgResponseTime * (totalResponses - 1) + responseTime) 
            / totalResponses
        );

        // المكافآت والعقوبات
        if (quality === ResponseQuality.EXCELLENT || quality === ResponseQuality.GOOD) {
            this.currentStreak++;
            const reward = quality;
            this.rewards += reward;
            this.reliabilityScore = Math.min(100, this.reliabilityScore + reward * 0.5);

            // مكافأة إضافية للسلسلة
            if (this.currentStreak >= 5) {
                const bonus = Math.floor(this.currentStreak / 5);
                this.rewards += bonus;
                log.info('Streak bonus earned', { 
                    agentId: this.agentId, 
                    bonus, 
                    streak: this.currentStreak 
                });
            }
        } else if (quality === ResponseQuality.POOR || quality === ResponseQuality.ACCEPTABLE) {
            this.currentStreak = 0;
            const penalty = (5 - quality);
            this.penalties += penalty;
            this.reliabilityScore = Math.max(0, this.reliabilityScore - penalty);
        }
    }

    updateFailure(penalty) {
        this.failed++;
        this.currentStreak = 0;
        this.penalties += penalty;
        this.reliabilityScore = Math.max(0, this.reliabilityScore - penalty);
    }

    getStatus() {
        const timeSinceSeen = Date.now() - this.lastSeen;
        
        if (timeSinceSeen > 300000) {  // 5 دقائق
            return AgentStatus.OFFLINE;
        } else if (this.reliabilityScore < 50) {
            return AgentStatus.UNRESPONSIVE;
        } else if (timeSinceSeen < 60000) {  // دقيقة واحدة
            return AgentStatus.ONLINE;
        } else {
            return AgentStatus.IDLE;
        }
    }
}

/**
 * نظام AIX3 Ping الرئيسي
 */
class AIXPingSystem {
    constructor() {
        this.agents = new Map();
        this.pendingPings = new Map();
        this.pingHistory = [];
        this.callbacks = new Map();
        this.escalationEnabled = true;
        this.monitoringInterval = null;
        
        log.info('AIX3 Ping System initialized');
    }

    /**
     * إرسال ping لوكيل معين
     */
    async pingAgent({
        fromAgent,
        toAgent,
        priority,
        message,
        requiresAction = false,
        context = {}
    }) {
        // إنشاء الوكيل إذا لم يكن موجوداً
        if (!this.agents.has(toAgent)) {
            this.agents.set(toAgent, new AgentMetrics(toAgent));
        }

        // إنشاء رسالة Ping
        const pingId = `ping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const ping = new PingMessage({
            pingId,
            fromAgent,
            toAgent,
            priority,
            message,
            requiresAction,
            context
        });

        // حفظ في السجل
        this.pendingPings.set(pingId, ping);
        this.agents.get(toAgent).totalPings++;

        // طباعة للمراقبة
        log.info('Ping sent', {
            pingId,
            fromAgent,
            toAgent,
            priority: ping._getPriorityName(),
            message,
            deadline: ping.deadline ? new Date(ping.deadline).toISOString() : 'No deadline'
        });

        // بدء المراقبة
        this._monitorPing(ping);

        return pingId;
    }

    /**
     * مراقبة الـ Ping وتتبع الاستجابة
     */
    _monitorPing(ping) {
        if (ping.deadline === null) {
            return; // لا يوجد deadline للـ INFO
        }

        const waitTime = ping.deadline - Date.now();
        if (waitTime > 0) {
            setTimeout(() => {
                this._handleTimeout(ping);
            }, waitTime);
        }
    }

    /**
     * معالجة انتهاء الوقت بدون استجابة
     */
    async _handleTimeout(ping) {
        if (!this.pendingPings.has(ping.pingId)) {
            return; // تم الرد بالفعل
        }

        const agent = this.agents.get(ping.toAgent);
        
        // حساب العقوبة
        const penaltyPoints = {
            [PingPriority.LOW]: 1,
            [PingPriority.NORMAL]: 2,
            [PingPriority.HIGH]: 5,
            [PingPriority.EMERGENCY]: 10
        };

        const penalty = penaltyPoints[ping.priority] || 1;
        agent.updateFailure(penalty);

        log.warn('Ping timeout', {
            pingId: ping.pingId,
            toAgent: ping.toAgent,
            priority: ping._getPriorityName(),
            penalty,
            reliabilityScore: agent.reliabilityScore
        });

        // تسجيل في التاريخ
        this.pingHistory.push({
            pingId: ping.pingId,
            agent: ping.toAgent,
            status: 'timeout',
            priority: ping._getPriorityName(),
            penalty,
            timestamp: Date.now()
        });

        // إزالة من القائمة المعلقة
        this.pendingPings.delete(ping.pingId);

        // تصعيد إذا كان مهماً
        if (this.escalationEnabled && 
            (ping.priority === PingPriority.HIGH || ping.priority === PingPriority.EMERGENCY)) {
            await this._escalatePing(ping);
        }
    }

    /**
     * تصعيد الـ Ping لوكيل آخر أو المدير
     */
    async _escalatePing(originalPing) {
        log.error('Escalating ping', {
            pingId: originalPing.pingId,
            originalTarget: originalPing.toAgent,
            priority: originalPing._getPriorityName()
        });

        // إرسال للمدير (Ona PM)
        const escalationMessage = `ESCALATION: ${originalPing.toAgent} لم يستجب لـ ping ذو أولوية ${originalPing._getPriorityName()}`;
        
        await this.pingAgent({
            fromAgent: 'system',
            toAgent: 'ona_pm',
            priority: PingPriority.HIGH,
            message: escalationMessage,
            context: {
                originalPing: originalPing.pingId,
                failedAgent: originalPing.toAgent
            }
        });
    }

    /**
     * استقبال استجابة (pong) من وكيل
     */
    async receivePong({
        pingId,
        fromAgent,
        status,
        message = null
    }) {
        if (!this.pendingPings.has(pingId)) {
            log.warn('Unknown ping_id received', { pingId, fromAgent });
            return ResponseQuality.FAILED;
        }

        const ping = this.pendingPings.get(pingId);
        const responseTime = (Date.now() - ping.timestamp) / 1000; // بالثواني
        const agent = this.agents.get(fromAgent);

        // حساب جودة الاستجابة
        const quality = this._calculateResponseQuality(ping, responseTime);

        // تحديث المقاييس
        agent.updateResponse(responseTime, quality);

        // طباعة النتيجة
        log.info('Pong received', {
            pingId,
            fromAgent,
            responseTime: `${responseTime.toFixed(2)}s`,
            status,
            quality: this._getQualityName(quality),
            reliabilityScore: agent.reliabilityScore
        });

        // حفظ في التاريخ
        this.pingHistory.push({
            pingId,
            agent: fromAgent,
            status: 'responded',
            responseTime,
            quality: this._getQualityName(quality),
            timestamp: Date.now()
        });

        // إزالة من القائمة المعلقة
        this.pendingPings.delete(pingId);

        return quality;
    }

    /**
     * حساب جودة الاستجابة بناءً على الوقت والأولوية
     */
    _calculateResponseQuality(ping, responseTime) {
        if (ping.deadline === null) {
            return ResponseQuality.GOOD;
        }

        const timeUntilDeadline = (ping.deadline - ping.timestamp) / 1000;
        const percentageUsed = responseTime / timeUntilDeadline;

        if (percentageUsed <= 0.25) {
            return ResponseQuality.EXCELLENT;
        } else if (percentageUsed <= 0.50) {
            return ResponseQuality.GOOD;
        } else if (percentageUsed <= 0.75) {
            return ResponseQuality.ACCEPTABLE;
        } else if (percentageUsed <= 1.0) {
            return ResponseQuality.POOR;
        } else {
            return ResponseQuality.FAILED;
        }
    }

    /**
     * الحصول على اسم الجودة
     */
    _getQualityName(quality) {
        const names = {
            [ResponseQuality.EXCELLENT]: 'EXCELLENT',
            [ResponseQuality.GOOD]: 'GOOD',
            [ResponseQuality.ACCEPTABLE]: 'ACCEPTABLE',
            [ResponseQuality.POOR]: 'POOR',
            [ResponseQuality.FAILED]: 'FAILED'
        };
        return names[quality];
    }

    /**
     * الحصول على حالة وكيل معين
     */
    getAgentStatus(agentId) {
        if (!this.agents.has(agentId)) {
            return { error: 'Agent not found' };
        }

        const agent = this.agents.get(agentId);
        const successRate = agent.totalPings > 0 ? (agent.responded / agent.totalPings * 100) : 0;

        return {
            agentId,
            status: agent.getStatus(),
            totalPings: agent.totalPings,
            responded: agent.responded,
            failed: agent.failed,
            successRate: `${successRate.toFixed(1)}%`,
            avgResponseTime: `${agent.avgResponseTime.toFixed(2)}s`,
            reliabilityScore: `${agent.reliabilityScore.toFixed(1)}/100`,
            currentStreak: agent.currentStreak,
            rewards: agent.rewards,
            penalties: agent.penalties,
            lastSeen: new Date(agent.lastSeen).toISOString()
        };
    }

    /**
     * تقرير شامل عن النظام
     */
    getSystemReport() {
        const totalPings = Array.from(this.agents.values()).reduce((sum, agent) => sum + agent.totalPings, 0);
        const totalResponded = Array.from(this.agents.values()).reduce((sum, agent) => sum + agent.responded, 0);
        const successRate = totalPings > 0 ? (totalResponded / totalPings * 100) : 0;

        return {
            systemHealth: successRate > 80 ? 'healthy' : 'degraded',
            totalAgents: this.agents.size,
            totalPings,
            pendingPings: this.pendingPings.size,
            totalResponded,
            systemSuccessRate: `${successRate.toFixed(1)}%`,
            agents: Object.fromEntries(
                Array.from(this.agents.keys()).map(agentId => [agentId, this.getAgentStatus(agentId)])
            )
        };
    }

    /**
     * طباعة لوحة تحكم مباشرة
     */
    printDashboard() {
        const report = this.getSystemReport();
        
        log.info('AIX3 Ping System Dashboard', {
            systemHealth: report.systemHealth.toUpperCase(),
            totalAgents: report.totalAgents,
            totalPings: report.totalPings,
            pendingPings: report.pendingPings,
            successRate: report.systemSuccessRate
        });

        // طباعة تفاصيل كل وكيل
        Object.entries(report.agents).forEach(([agentId, status]) => {
            log.info('Agent Status', {
                agentId: agentId.toUpperCase(),
                status: status.status,
                reliability: status.reliabilityScore,
                successRate: status.successRate,
                avgResponse: status.avgResponseTime,
                streak: status.currentStreak,
                rewards: status.rewards,
                penalties: status.penalties
            });
        });
    }

    /**
     * بدء مراقبة النظام
     */
    startMonitoring(intervalMs = 30000) {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        this.monitoringInterval = setInterval(() => {
            this.printDashboard();
        }, intervalMs);

        log.info('System monitoring started', { intervalMs });
    }

    /**
     * إيقاف مراقبة النظام
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            log.info('System monitoring stopped');
        }
    }
}

module.exports = {
    AIXPingSystem,
    PingMessage,
    PingResponse,
    AgentMetrics,
    PingPriority,
    AgentStatus,
    ResponseQuality
};