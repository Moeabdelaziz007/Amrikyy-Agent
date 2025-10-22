const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const UserAgent = require('user-agents');

class ContentExtractor {
  _parseWithReadability(html, url) {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      const $ = cheerio.load(html);
      $('script, style, nav, header, footer, aside').remove();
      const bodyText = $('body').text().replace(/\s\s+/g, ' ').trim();
      return {
        title: article?.title || $('title').text() || url,
        content: bodyText,
        excerpt: article?.excerpt || bodyText.slice(0, 300),
        url: url,
      };
    }

    return {
      title: article.title,
      content: article.textContent,
      excerpt: article.excerpt,
      url: url,
    };
  }

  async extractWithCheerio(url) {
    const response = await axios.get(url, {
      headers: { 'User-Agent': new UserAgent().toString() },
      timeout: 15000,
    });
    return this._parseWithReadability(response.data, url);
  }

  async extractWithPuppeteer(url) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    try {
      await page.setUserAgent(new UserAgent().toString());
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      const html = await page.content();
      return this._parseWithReadability(html, url);
    } finally {
      await browser.close();
    }
  }

  async extract(url) {
    try {
      console.log(`[ContentExtractor] Attempting Cheerio extraction for: ${url}`);
      const content = await this.extractWithCheerio(url);
      if (content && content.content && content.content.length > 150) {
        console.log(`[ContentExtractor] Cheerio extraction successful for: ${url}`);
        return content;
      }
      console.warn(
        `[ContentExtractor] Cheerio returned empty content for ${url}. Falling back to Puppeteer.`
      );
    } catch (error) {
      console.warn(
        `[ContentExtractor] Cheerio extraction failed for ${url}: ${error.message}. Falling back to Puppeteer.`
      );
    }

    try {
      console.log(`[ContentExtractor] Attempting Puppeteer extraction for: ${url}`);
      const content = await this.extractWithPuppeteer(url);
      console.log(`[ContentExtractor] Puppeteer extraction successful for: ${url}`);
      return content;
    } catch (error) {
      console.error(`[ContentExtractor] Puppeteer extraction failed for ${url}: ${error.message}`);
      throw new Error(`Failed to extract content from ${url} after multiple attempts.`);
    }
  }
}

module.exports = ContentExtractor;
