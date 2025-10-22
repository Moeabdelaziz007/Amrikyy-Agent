/**
 * SEOMonitor - Search Console monitoring and analytics
 * 
 * Features:
 * - Fetch Search Analytics data (clicks, impressions, CTR, position)
 * - URL Inspection API (indexing status, canonical, mobile usability)
 * - Coverage monitoring (errors, warnings, excluded pages)
 * - Performance tracking over time
 * - Automated alerts for issues
 * 
 * @author Ona AI
 * @created 2025-01-25
 */

const { google } = require('googleapis');

class SEOMonitor {
  constructor(options = {}) {
    this.siteUrl = options.siteUrl || process.env.SITE_URL || 'https://amrikyy.com/';
    
    // Google Auth
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/webmasters.readonly',
        'https://www.googleapis.com/auth/webmasters'
      ],
    });
  }

  /**
   * Fetch Search Analytics data
   */
  async getSearchAnalytics(options = {}) {
    try {
      const client = await this.auth.getClient();
      const searchconsole = google.searchconsole({ version: 'v1', auth: client });

      const {
        startDate = this.getDateDaysAgo(7),
        endDate = this.getDateDaysAgo(0),
        dimensions = ['page'],
        rowLimit = 1000,
        aggregationType = 'auto'
      } = options;

      const request = {
        startDate,
        endDate,
        dimensions,
        rowLimit,
        aggregationType
      };

      const response = await searchconsole.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: request
      });

      const rows = response.data.rows || [];
      
      console.log(`✅ Fetched ${rows.length} Search Analytics rows`);
      
      return {
        success: true,
        data: rows.map(row => ({
          keys: row.keys,
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
          ctr: row.ctr || 0,
          position: row.position || 0
        })),
        totalRows: rows.length,
        dateRange: { startDate, endDate }
      };
    } catch (error) {
      console.error('❌ Failed to fetch Search Analytics:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get top pages by clicks
   */
  async getTopPages(days = 7, limit = 10) {
    const result = await this.getSearchAnalytics({
      startDate: this.getDateDaysAgo(days),
      endDate: this.getDateDaysAgo(0),
      dimensions: ['page'],
      rowLimit: limit
    });

    if (!result.success) return result;

    // Sort by clicks
    const sorted = result.data.sort((a, b) => b.clicks - a.clicks);
    
    return {
      success: true,
      pages: sorted.map(row => ({
        url: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: (row.ctr * 100).toFixed(2) + '%',
        position: row.position.toFixed(1)
      }))
    };
  }

  /**
   * Get top queries by clicks
   */
  async getTopQueries(days = 7, limit = 10) {
    const result = await this.getSearchAnalytics({
      startDate: this.getDateDaysAgo(days),
      endDate: this.getDateDaysAgo(0),
      dimensions: ['query'],
      rowLimit: limit
    });

    if (!result.success) return result;

    // Sort by clicks
    const sorted = result.data.sort((a, b) => b.clicks - a.clicks);
    
    return {
      success: true,
      queries: sorted.map(row => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: (row.ctr * 100).toFixed(2) + '%',
        position: row.position.toFixed(1)
      }))
    };
  }

  /**
   * Get performance summary
   */
  async getPerformanceSummary(days = 7) {
    const result = await this.getSearchAnalytics({
      startDate: this.getDateDaysAgo(days),
      endDate: this.getDateDaysAgo(0),
      dimensions: []  // No dimensions = totals only
    });

    if (!result.success) return result;

    const totals = result.data[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    
    return {
      success: true,
      summary: {
        totalClicks: totals.clicks,
        totalImpressions: totals.impressions,
        averageCTR: (totals.ctr * 100).toFixed(2) + '%',
        averagePosition: totals.position.toFixed(1),
        dateRange: result.dateRange
      }
    };
  }

  /**
   * Inspect URL indexing status
   */
  async inspectURL(url) {
    try {
      const client = await this.auth.getClient();
      const searchconsole = google.searchconsole({ version: 'v1', auth: client });

      const fullUrl = url.startsWith('http') ? url : `${this.siteUrl}${url.replace(/^\//, '')}`;

      const response = await searchconsole.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl: fullUrl,
          siteUrl: this.siteUrl
        }
      });

      const result = response.data.inspectionResult.indexStatusResult;
      
      console.log(`✅ Inspected URL: ${fullUrl}`);
      
      return {
        success: true,
        url: fullUrl,
        verdict: result.verdict,
        coverageState: result.coverageState,
        robotsTxtState: result.robotsTxtState,
        indexingState: result.indexingState,
        lastCrawlTime: result.lastCrawlTime,
        pageFetchState: result.pageFetchState,
        googleCanonical: result.googleCanonical,
        userCanonical: result.userCanonical,
        crawledAs: result.crawledAs
      };
    } catch (error) {
      console.error(`❌ Failed to inspect URL ${url}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Batch inspect multiple URLs
   */
  async inspectURLs(urls) {
    const results = [];
    
    for (const url of urls) {
      const result = await this.inspectURL(url);
      results.push(result);
      
      // Rate limiting: wait 1 second between requests
      await this.sleep(1000);
    }
    
    return {
      success: true,
      results,
      total: results.length,
      passed: results.filter(r => r.verdict === 'PASS').length,
      failed: results.filter(r => r.verdict === 'FAIL').length
    };
  }

  /**
   * Get site verification status
   */
  async getSiteInfo() {
    try {
      const client = await this.auth.getClient();
      const searchconsole = google.searchconsole({ version: 'v1', auth: client });

      const response = await searchconsole.sites.get({
        siteUrl: this.siteUrl
      });

      return {
        success: true,
        site: response.data
      };
    } catch (error) {
      console.error('❌ Failed to get site info:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List all verified sites
   */
  async listSites() {
    try {
      const client = await this.auth.getClient();
      const searchconsole = google.searchconsole({ version: 'v1', auth: client });

      const response = await searchconsole.sites.list();

      return {
        success: true,
        sites: response.data.siteEntry || []
      };
    } catch (error) {
      console.error('❌ Failed to list sites:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Compare performance between two periods
   */
  async comparePerformance(currentDays = 7, previousDays = 7) {
    const current = await this.getPerformanceSummary(currentDays);
    const previous = await this.getSearchAnalytics({
      startDate: this.getDateDaysAgo(currentDays + previousDays),
      endDate: this.getDateDaysAgo(currentDays),
      dimensions: []
    });

    if (!current.success || !previous.success) {
      return { success: false, error: 'Failed to fetch comparison data' };
    }

    const prevTotals = previous.data[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    const currTotals = current.summary;

    const calculateChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev * 100).toFixed(1);
    };

    return {
      success: true,
      comparison: {
        clicks: {
          current: currTotals.totalClicks,
          previous: prevTotals.clicks,
          change: calculateChange(currTotals.totalClicks, prevTotals.clicks) + '%'
        },
        impressions: {
          current: currTotals.totalImpressions,
          previous: prevTotals.impressions,
          change: calculateChange(currTotals.totalImpressions, prevTotals.impressions) + '%'
        },
        ctr: {
          current: currTotals.averageCTR,
          previous: (prevTotals.ctr * 100).toFixed(2) + '%',
          change: calculateChange(parseFloat(currTotals.averageCTR), prevTotals.ctr * 100) + '%'
        },
        position: {
          current: currTotals.averagePosition,
          previous: prevTotals.position.toFixed(1),
          change: calculateChange(parseFloat(currTotals.averagePosition), prevTotals.position) + '%'
        }
      }
    };
  }

  /**
   * Helper: Get date N days ago in YYYY-MM-DD format
   */
  getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Helper: Sleep for N milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate daily report
   */
  async generateDailyReport() {
    console.log('📊 Generating daily SEO report...');
    
    const [summary, topPages, topQueries, comparison] = await Promise.all([
      this.getPerformanceSummary(7),
      this.getTopPages(7, 10),
      this.getTopQueries(7, 10),
      this.comparePerformance(7, 7)
    ]);

    return {
      success: true,
      report: {
        generatedAt: new Date().toISOString(),
        summary: summary.success ? summary.summary : null,
        topPages: topPages.success ? topPages.pages : [],
        topQueries: topQueries.success ? topQueries.queries : [],
        comparison: comparison.success ? comparison.comparison : null
      }
    };
  }
}

module.exports = SEOMonitor;
