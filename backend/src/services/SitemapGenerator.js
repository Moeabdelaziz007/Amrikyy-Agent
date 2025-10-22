/**
 * SitemapGenerator - Automated sitemap generation and submission
 * 
 * Features:
 * - Generate sitemap.xml from routes
 * - Submit to Google Search Console
 * - Ping Google with sitemap URL
 * - Support for multiple sitemaps (blog, products, etc.)
 * 
 * @author Ona AI
 * @created 2025-01-25
 */

const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

class SitemapGenerator {
  constructor(options = {}) {
    this.siteUrl = options.siteUrl || process.env.SITE_URL || 'https://amrikyy.com/';
    this.outputDir = options.outputDir || path.join(__dirname, '../../../frontend/public');
    this.routes = options.routes || [];
    
    // Google Auth
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/webmasters'],
    });
  }

  /**
   * Generate sitemap XML
   */
  async generateSitemap(urls) {
    const now = new Date().toISOString();
    
    const urlEntries = urls.map(url => {
      const fullUrl = url.startsWith('http') ? url : `${this.siteUrl}${url.replace(/^\//, '')}`;
      const priority = this.calculatePriority(url);
      const changefreq = this.calculateChangeFreq(url);
      
      return `  <url>
    <loc>${this.escapeXml(fullUrl)}</loc>
    <lastmod>${url.lastmod || now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    return sitemap;
  }

  /**
   * Calculate priority based on URL
   */
  calculatePriority(url) {
    if (url === '/' || url === '') return '1.0';
    if (url.includes('/blog/')) return '0.8';
    if (url.includes('/docs/')) return '0.7';
    if (url.includes('/about') || url.includes('/contact')) return '0.6';
    return '0.5';
  }

  /**
   * Calculate change frequency based on URL
   */
  calculateChangeFreq(url) {
    if (url === '/' || url === '') return 'daily';
    if (url.includes('/blog/')) return 'weekly';
    if (url.includes('/docs/')) return 'monthly';
    return 'monthly';
  }

  /**
   * Escape XML special characters
   */
  escapeXml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Save sitemap to file
   */
  async saveSitemap(content, filename = 'sitemap.xml') {
    const filePath = path.join(this.outputDir, filename);
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`✅ Sitemap saved to: ${filePath}`);
    return filePath;
  }

  /**
   * Submit sitemap to Google Search Console
   */
  async submitToGoogle(sitemapUrl) {
    try {
      const client = await this.auth.getClient();
      const searchconsole = google.searchconsole({ version: 'v1', auth: client });

      const fullSitemapUrl = sitemapUrl.startsWith('http') 
        ? sitemapUrl 
        : `${this.siteUrl}${sitemapUrl.replace(/^\//, '')}`;

      await searchconsole.sitemaps.submit({
        siteUrl: this.siteUrl,
        feedpath: fullSitemapUrl
      });

      console.log(`✅ Sitemap submitted to Google: ${fullSitemapUrl}`);
      return { success: true, url: fullSitemapUrl };
    } catch (error) {
      console.error('❌ Failed to submit sitemap:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Ping Google with sitemap URL (alternative method)
   */
  async pingSitemap(sitemapUrl) {
    try {
      const fullSitemapUrl = sitemapUrl.startsWith('http') 
        ? sitemapUrl 
        : `${this.siteUrl}${sitemapUrl.replace(/^\//, '')}`;

      const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(fullSitemapUrl)}`;
      
      const response = await fetch(pingUrl);
      
      if (response.ok) {
        console.log(`✅ Pinged Google with sitemap: ${fullSitemapUrl}`);
        return { success: true, url: fullSitemapUrl };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Failed to ping sitemap:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * List submitted sitemaps
   */
  async listSitemaps() {
    try {
      const client = await this.auth.getClient();
      const searchconsole = google.searchconsole({ version: 'v1', auth: client });

      const response = await searchconsole.sitemaps.list({
        siteUrl: this.siteUrl
      });

      return response.data.sitemap || [];
    } catch (error) {
      console.error('❌ Failed to list sitemaps:', error.message);
      return [];
    }
  }

  /**
   * Delete a sitemap
   */
  async deleteSitemap(sitemapUrl) {
    try {
      const client = await this.auth.getClient();
      const searchconsole = google.searchconsole({ version: 'v1', auth: client });

      await searchconsole.sitemaps.delete({
        siteUrl: this.siteUrl,
        feedpath: sitemapUrl
      });

      console.log(`✅ Sitemap deleted: ${sitemapUrl}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete sitemap:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate sitemap from React routes
   */
  async generateFromRoutes(routes) {
    const urls = routes.map(route => ({
      loc: route.path,
      lastmod: route.lastmod || new Date().toISOString(),
      priority: route.priority,
      changefreq: route.changefreq
    }));

    return this.generateSitemap(urls);
  }

  /**
   * Full workflow: Generate, save, and submit
   */
  async generateAndSubmit(routes) {
    console.log('🚀 Starting sitemap generation and submission...');
    
    try {
      // Generate sitemap
      const sitemap = await this.generateFromRoutes(routes);
      
      // Save to file
      await this.saveSitemap(sitemap);
      
      // Submit to Google
      const sitemapUrl = `${this.siteUrl}sitemap.xml`;
      const submitResult = await this.submitToGoogle(sitemapUrl);
      
      // Also ping Google (backup method)
      await this.pingSitemap(sitemapUrl);
      
      console.log('✅ Sitemap generation and submission complete!');
      
      return {
        success: true,
        sitemap,
        sitemapUrl,
        submitResult
      };
    } catch (error) {
      console.error('❌ Sitemap workflow failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = SitemapGenerator;
