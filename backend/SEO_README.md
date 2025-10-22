# SEO Dashboard & Automation System

Complete SEO monitoring and automation system for Amrikyy platform.

## Features

### 📊 SEO Dashboard
- Real-time performance metrics (clicks, impressions, CTR, position)
- Top pages and queries analysis
- Period comparison with trend indicators
- Advanced filtering and sorting
- CSV export functionality
- Responsive design with dark mode support

### 🤖 Automation
- Daily SEO reports generation
- Automatic sitemap submission to Google
- Scheduled performance monitoring
- Slack notifications (optional)

### 🔒 Security & Performance
- Rate limiting (100 requests/15min for analytics, 10 requests/hour for operations)
- Redis caching with fallback to memory
- Error logging with Winston
- Health checks
- Input validation

## API Endpoints

### Analytics
```bash
# Get performance summary
GET /api/seo/analytics/summary?days=7

# Get top pages
GET /api/seo/analytics/top-pages?days=7&limit=10

# Get top queries
GET /api/seo/analytics/top-queries?days=7&limit=10

# Compare periods
GET /api/seo/analytics/comparison?days=7
```

### Sitemap
```bash
# Generate sitemap
POST /api/seo/sitemap/generate
Content-Type: application/json
{
  "routes": ["/", "/about", "/contact"]
}

# Submit sitemap to Google
POST /api/seo/sitemap/submit
Content-Type: application/json
{
  "sitemapUrl": "https://amrikyy.com/sitemap.xml"
}
```

### Monitoring
```bash
# Inspect single URL
POST /api/seo/inspect
Content-Type: application/json
{
  "url": "https://amrikyy.com/page"
}

# Inspect multiple URLs
POST /api/seo/inspect/batch
Content-Type: application/json
{
  "urls": ["https://amrikyy.com/page1", "https://amrikyy.com/page2"]
}

# Get daily report
GET /api/seo/report

# Health check
GET /api/seo/health
```

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
```bash
# Google Search Console API
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Optional: Admin token for protected endpoints
SEO_ADMIN_TOKEN=your_admin_token

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

### 3. Setup Google Search Console API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google Search Console API"
4. Create service account credentials
5. Download JSON credentials file
6. Add service account email to Search Console property

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

### 5. Access Dashboard
Open browser: `http://localhost:5173/seo`

## GitHub Actions Automation

### Setup
1. Add secrets in GitHub repository settings:
   - `GOOGLE_APPLICATION_CREDENTIALS`
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SLACK_WEBHOOK_URL` (optional)

2. Workflow runs automatically daily at 9 AM UTC

3. Manual trigger: Actions → SEO Automation → Run workflow

### What it does
- Generates daily SEO report
- Submits sitemap to Google
- Sends Slack notification (if configured)

## Usage Examples

### Fetch Performance Summary
```bash
curl -X GET "http://localhost:3000/api/seo/analytics/summary?days=30" \
  -H "Content-Type: application/json"
```

### Generate and Submit Sitemap
```bash
# Generate
curl -X POST "http://localhost:3000/api/seo/sitemap/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "routes": ["/", "/search", "/bookings", "/about"]
  }'

# Submit
curl -X POST "http://localhost:3000/api/seo/sitemap/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "sitemapUrl": "https://amrikyy.com/sitemap.xml"
  }'
```

### Inspect URL
```bash
curl -X POST "http://localhost:3000/api/seo/inspect" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://amrikyy.com/search"
  }'
```

### Get Daily Report
```bash
curl -X GET "http://localhost:3000/api/seo/report" \
  -H "Content-Type: application/json"
```

## Dashboard Features

### Metrics Cards
- Total clicks with trend indicator
- Total impressions with trend indicator
- Average CTR with trend indicator
- Average position with trend indicator

### Top Pages Table
- URL, clicks, impressions, CTR
- Search/filter by URL
- Sort by clicks, impressions, or CTR
- Responsive design

### Top Queries Table
- Query, clicks, impressions, CTR
- Search/filter by query
- Sort by clicks, impressions, or CTR
- Responsive design

### Controls
- Period selector (7, 30, 90 days)
- Export to CSV button
- Refresh button
- Loading states
- Error handling

## Rate Limits

### Analytics Endpoints
- 100 requests per 15 minutes per IP
- Applies to: summary, pages, queries, comparison, report

### Operation Endpoints
- 10 requests per hour per IP
- Applies to: sitemap generation, sitemap submission, batch inspection

## Caching Strategy

### Frontend (SessionStorage)
- Top queries: 5 minutes TTL
- Automatic cache invalidation on period change

### Backend (Redis)
- Flight searches: 5 minutes TTL
- Hotel searches: 1 hour TTL
- AI responses: 30 minutes TTL
- Location data: 24 hours TTL
- User preferences: 1 hour TTL

## Error Handling

### Frontend
- Network errors with user-friendly messages
- Retry logic for failed requests (3 attempts with exponential backoff)
- Loading states
- Empty states

### Backend
- Comprehensive error logging with Winston
- Structured error responses
- HTTP status codes
- Error tracking

## Monitoring

### Health Check
```bash
curl http://localhost:3000/api/seo/health
```

Response:
```json
{
  "success": true,
  "status": "healthy",
  "services": {
    "searchConsole": "connected",
    "gemini": "active",
    "redis": "connected"
  },
  "timestamp": "2025-01-25T10:00:00.000Z"
}
```

## Troubleshooting

### Google Search Console API Errors
- Verify service account has access to property
- Check credentials file path
- Ensure API is enabled in Google Cloud Console

### Rate Limit Errors
- Wait for rate limit window to reset
- Implement request queuing in client
- Consider upgrading rate limits

### Cache Issues
- Clear Redis: `redis-cli FLUSHALL`
- Clear browser cache: DevTools → Application → Storage
- Restart backend server

## Development

### Run Tests
```bash
npm test
```

### Validate APIs
```bash
npm run validate-apis
```

### Type Check
```bash
npm run typecheck
```

## Production Deployment

### Environment Setup
1. Set all required environment variables
2. Configure Redis for production
3. Setup SSL certificates
4. Configure reverse proxy (nginx)

### Monitoring
- Setup error tracking (Sentry)
- Configure log aggregation
- Setup uptime monitoring
- Configure alerts

### Scaling
- Use Redis cluster for caching
- Implement load balancing
- Setup CDN for static assets
- Configure auto-scaling

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [github.com/Moeabdelaziz007/Amrikyy-Agent/issues](https://github.com/Moeabdelaziz007/Amrikyy-Agent/issues)
- Email: support@amrikyy.com

---

**Last Updated**: January 25, 2025  
**Version**: 1.0.0  
**Author**: Ona AI
