# AIX Telegram Webhook Setup Guide

## 🚀 Overview

This guide explains how to set up and deploy the AIX Enhanced Telegram Bot with webhook integration for production use. The system features intelligent agent orchestration, instant feedback indicators, and comprehensive monitoring capabilities.

## ✨ Key Features

- **Intelligent Agent Orchestration**: Automatically selects the best AIX agent based on message content
- **Instant Feedback Indicators**: Real-time typing indicators and processing feedback
- **Quantum Thinking**: Advanced decision-making using quantum topological analysis
- **Comprehensive Testing**: Full test suite for validation
- **Production Ready**: Built-in monitoring, logging, and error handling

## 📋 Prerequisites

- Node.js 18+ installed
- Telegram Bot Token from [@BotFather](https://t.me/botfather)
- Server with HTTPS support (required for webhooks)
- Domain name or ngrok for local testing

## 🔧 Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Server Configuration
PORT=5000
SERVER_URL=https://your-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# AIX Configuration
AIX_DIRECTORY=./agents/aix
FEEDBACK_ENABLED=true
QUANTUM_ENABLED=true
MEMORY_ENABLED=true

# Database (if using)
DATABASE_URL=your_database_url
```

## 🛠️ Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up AIX Agents

Ensure all AIX agent files are in the `agents/aix/` directory:
- `luna-v1.aix`
- `karim-v1.aix`
- `zara-v1.aix`
- `leo-v1.aix`
- `kody-v1.aix`
- `scout-v1.aix`

### 3. Start the Server

```bash
npm start
```

The server will initialize the AIX Enhanced Cursor Manager and be ready to receive webhooks.

## 🔗 Webhook Setup

### 1. Set Webhook URL

Use the Telegram Bot API to set your webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://your-domain.com/api/telegram/aix/webhook"
     }'
```

### 2. Verify Webhook

Check if the webhook is set correctly:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

### 3. Test Webhook

Run the test suite to verify everything is working:

```bash
node test-aix-telegram-webhook.js
```

## 🧪 Testing

### Manual Testing

Test individual endpoints:

```bash
# Health check
curl https://your-domain.com/api/telegram/aix/health

# Agent status
curl https://your-domain.com/api/telegram/aix/agents

# Test message
curl -X POST https://your-domain.com/api/telegram/aix/test \
     -H "Content-Type: application/json" \
     -d '{"message": "Plan a trip to Tokyo"}'
```

### Automated Testing

Run the comprehensive test suite:

```bash
node test-aix-telegram-webhook.js
```

## 📊 Monitoring

### Health Endpoints

- **Health Check**: `GET /api/telegram/aix/health`
- **Agent Status**: `GET /api/telegram/aix/agents`
- **Server Health**: `GET /api/health`

### Logs

The system uses Winston for structured logging. Check logs for:
- Webhook processing times
- Agent selection decisions
- Error messages
- Performance metrics

### Metrics

Monitor these key metrics:
- Webhook response time
- Agent selection accuracy
- Error rates
- Memory usage

## 🚨 Error Handling

### Common Issues

1. **AIX Manager not initialized**
   - Check if all AIX files are present
   - Verify file permissions
   - Check logs for initialization errors

2. **Webhook not receiving messages**
   - Verify webhook URL is correct
   - Check HTTPS certificate
   - Ensure server is accessible

3. **Agent selection failures**
   - Check agent capabilities mapping
   - Verify task parameters
   - Review agent configuration

### Debugging

Enable verbose logging by setting `verbose: true` in the AIX Manager configuration.

## 🔒 Security

### Rate Limiting

The webhook endpoint uses rate limiting to prevent abuse:
- Webhook limiter: 100 requests per minute
- General limiter: 1000 requests per hour

### Input Validation

All webhook inputs are validated:
- Message structure validation
- User data sanitization
- Parameter type checking

### Error Responses

Error responses don't expose sensitive information:
- Generic error messages for users
- Detailed logs for debugging
- Proper HTTP status codes

## 🚀 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] HTTPS certificate installed
- [ ] Webhook URL set
- [ ] Rate limiting configured
- [ ] Logging configured
- [ ] Monitoring set up
- [ ] Error handling tested
- [ ] Performance tested

### Scaling Considerations

- Use load balancer for multiple instances
- Implement Redis for session storage
- Set up database connection pooling
- Monitor memory usage and CPU

## 📈 Performance Optimization

### Caching

- Agent definitions are cached
- Memory queries are cached
- Response templates are cached

### Async Processing

- Webhook processing is fully async
- Agent orchestration is non-blocking
- Database operations are async

### Resource Management

- Connection pooling
- Memory cleanup
- Garbage collection monitoring

## 🔄 Maintenance

### Regular Tasks

1. **Monitor logs** for errors and performance
2. **Update AIX agents** as needed
3. **Review webhook performance** metrics
4. **Test agent capabilities** regularly
5. **Update dependencies** monthly

### Backup Strategy

- Backup AIX agent files
- Backup configuration files
- Backup environment variables
- Backup logs for analysis

## 📞 Support

For issues or questions:
1. Check the logs first
2. Run the test suite
3. Verify configuration
4. Check Telegram Bot API status
5. Review this documentation

## 🎯 Next Steps

After successful deployment:
1. Set up monitoring dashboards
2. Configure alerting
3. Implement user analytics
4. Add more AIX agents
5. Optimize performance
