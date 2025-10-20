/**
 * ============================================
 * GEMINI CREATIVE AGENT
 * AI-Powered Autonomous Mini-App Generator
 * ============================================
 * 
 * Features:
 * - Uses Gemini 1.5 Flash (FREE tier)
 * - Crawls web for inspiration (HN, PH, GitHub)
 * - Generates creative ideas
 * - Generates mini-app code (HTML/CSS/JS/React)
 * - Integrates with OpenMemory MCP
 * - Autonomous operation (cron scheduling)
 * - Full API for control
 */

import cron from 'node-cron';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';

// ============================================
// INTERFACES
// ============================================

export interface GeminiCreativeAgentConfig {
  geminiApiKey: string;
  model?: string; // Default: gemini-1.5-flash
  schedule?: string; // Cron expression (default: every 6 hours)
  runOnInit?: boolean; // Run immediately on start
  maxIdeasPerRun?: number; // Max ideas to generate per run
  categories?: string[]; // Categories to focus on
  inspirationUrls?: string[]; // URLs to crawl for inspiration
  storageCallback?: (data: {
    ideas: CreativeIdea[];
    miniApps: GeneratedMiniApp[];
    timestamp: string;
  }) => Promise<void>;
}

export interface CreativeIdea {
  id: string;
  name: string;
  description: string;
  category: string;
  targetAudience: string;
  uniqueValue: string;
  estimatedComplexity: 'simple' | 'medium' | 'complex';
  inspirationSource?: string;
  timestamp: string;
}

export interface GeneratedMiniApp {
  id: string;
  name: string;
  description: string;
  category: string;
  code: {
    html?: string;
    css?: string;
    javascript?: string;
    react?: string;
  };
  technicalApproach: string;
  features: string[];
  timestamp: string;
}

interface AgentStatus {
  isRunning: boolean;
  lastRun?: string;
  nextRun?: string;
  totalIdeasGenerated: number;
  totalMiniAppsGenerated: number;
  currentSchedule: string;
}

// ============================================
// GEMINI CREATIVE AGENT CLASS
// ============================================

export class GeminiCreativeAgent {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private config: Required<GeminiCreativeAgentConfig>;
  private cronJob?: cron.ScheduledTask;
  private isRunning: boolean = false;
  private stats = {
    totalIdeasGenerated: 0,
    totalMiniAppsGenerated: 0,
    lastRun: null as string | null,
  };

  constructor(config: GeminiCreativeAgentConfig) {
    // Initialize Gemini AI
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({
      model: config.model || 'gemini-1.5-flash',
    });

    // Set defaults
    this.config = {
      geminiApiKey: config.geminiApiKey,
      model: config.model || 'gemini-1.5-flash',
      schedule: config.schedule || '0 */6 * * *', // Every 6 hours
      runOnInit: config.runOnInit ?? false,
      maxIdeasPerRun: config.maxIdeasPerRun || 3,
      categories: config.categories || [
        'productivity',
        'games',
        'tools',
        'education',
        'creative',
      ],
      inspirationUrls: config.inspirationUrls || [
        'https://news.ycombinator.com',
        'https://www.producthunt.com',
        'https://github.com/trending',
      ],
      storageCallback: config.storageCallback || (async () => {}),
    };

    console.log('🎨 GeminiCreativeAgent initialized');
    console.log(`   Model: ${this.config.model}`);
    console.log(`   Schedule: ${this.config.schedule}`);
    console.log(`   Categories: ${this.config.categories.join(', ')}`);
  }

  // ============================================
  // PUBLIC METHODS
  // ============================================

  /**
   * Start the autonomous agent
   */
  public start(): void {
    if (this.cronJob) {
      console.log('⚠️  GeminiCreativeAgent already running');
      return;
    }

    console.log('▶️  Starting GeminiCreativeAgent...');

    // Schedule cron job
    this.cronJob = cron.schedule(this.config.schedule, async () => {
      await this.executeCreativeRun();
    });

    // Run immediately if configured
    if (this.config.runOnInit) {
      this.executeCreativeRun();
    }

    this.isRunning = true;
    console.log('✅ GeminiCreativeAgent started');
  }

  /**
   * Stop the autonomous agent
   */
  public stop(): void {
    if (!this.cronJob) {
      console.log('⚠️  GeminiCreativeAgent not running');
      return;
    }

    this.cronJob.stop();
    this.cronJob = undefined;
    this.isRunning = false;
    console.log('⏹️  GeminiCreativeAgent stopped');
  }

  /**
   * Trigger manual creative run
   */
  public async triggerManualRun(): Promise<{
    ideas: CreativeIdea[];
    miniApps: GeneratedMiniApp[];
  }> {
    console.log('🎨 Manual creative run triggered');
    return await this.executeCreativeRun();
  }

  /**
   * Get agent status
   */
  public getStatus(): AgentStatus {
    return {
      isRunning: this.isRunning,
      lastRun: this.stats.lastRun || undefined,
      nextRun: this.cronJob ? this.getNextRunTime() : undefined,
      totalIdeasGenerated: this.stats.totalIdeasGenerated,
      totalMiniAppsGenerated: this.stats.totalMiniAppsGenerated,
      currentSchedule: this.config.schedule,
    };
  }

  /**
   * Update inspiration URLs
   */
  public setInspirationUrls(urls: string[]): void {
    if (!Array.isArray(urls) || urls.length === 0) {
      throw new Error('URLs must be a non-empty array');
    }
    this.config.inspirationUrls = urls;
    console.log(`🔗 Updated inspiration URLs: ${urls.length} sources`);
  }

  // ============================================
  // PRIVATE METHODS - CORE LOGIC
  // ============================================

  /**
   * Execute a full creative run
   */
  private async executeCreativeRun(): Promise<{
    ideas: CreativeIdea[];
    miniApps: GeneratedMiniApp[];
  }> {
    console.log('\n🚀 ========================================');
    console.log('🎨 CREATIVE RUN STARTED');
    console.log('========================================\n');

    const timestamp = new Date().toISOString();
    const ideas: CreativeIdea[] = [];
    const miniApps: GeneratedMiniApp[] = [];

    try {
      // Step 1: Gather inspiration from web
      console.log('📡 Step 1: Gathering web inspiration...');
      const inspiration = await this.gatherInspiration();
      console.log(`✅ Collected ${inspiration.length} inspiration items\n`);

      // Step 2: Generate creative ideas
      console.log('💡 Step 2: Generating creative ideas...');
      const generatedIdeas = await this.generateIdeas(inspiration);
      ideas.push(...generatedIdeas);
      console.log(`✅ Generated ${generatedIdeas.length} ideas\n`);

      // Step 3: Generate mini-app code for top ideas
      console.log('🔨 Step 3: Generating mini-app code...');
      for (const idea of generatedIdeas.slice(0, 2)) {
        // Top 2 ideas
        try {
          const miniApp = await this.generateMiniAppCode(idea);
          miniApps.push(miniApp);
          console.log(`✅ Generated code for: ${miniApp.name}`);
        } catch (error) {
          console.error(`❌ Failed to generate code for: ${idea.name}`, error);
        }
      }
      console.log('');

      // Step 4: Store results via callback
      console.log('💾 Step 4: Storing results...');
      await this.config.storageCallback({
        ideas,
        miniApps,
        timestamp,
      });
      console.log('✅ Results stored\n');

      // Update stats
      this.stats.totalIdeasGenerated += ideas.length;
      this.stats.totalMiniAppsGenerated += miniApps.length;
      this.stats.lastRun = timestamp;

      console.log('========================================');
      console.log('✅ CREATIVE RUN COMPLETED');
      console.log(`   Ideas: ${ideas.length}`);
      console.log(`   Mini-Apps: ${miniApps.length}`);
      console.log('========================================\n');

      return { ideas, miniApps };
    } catch (error) {
      console.error('❌ Creative run failed:', error);
      throw error;
    }
  }

  /**
   * Gather inspiration from web sources
   */
  private async gatherInspiration(): Promise<string[]> {
    const inspiration: string[] = [];

    for (const url of this.config.inspirationUrls) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; GeminiCreativeAgent/1.0)',
          },
          timeout: 10000,
        });

        const html = await response.text();

        // Extract text (basic extraction)
        const text = this.extractTextFromHtml(html);
        const summary = text.substring(0, 2000); // First 2000 chars

        inspiration.push(`Source: ${url}\n${summary}`);
      } catch (error) {
        console.warn(`⚠️  Failed to fetch ${url}:`, error);
      }
    }

    return inspiration;
  }

  /**
   * Generate creative ideas using Gemini
   */
  private async generateIdeas(
    inspiration: string[]
  ): Promise<CreativeIdea[]> {
    const prompt = `You are a creative AI that generates innovative mini-app ideas.

INSPIRATION FROM WEB:
${inspiration.join('\n\n')}

TASK:
Generate ${this.config.maxIdeasPerRun} creative and innovative mini-app ideas.

CATEGORIES TO FOCUS ON:
${this.config.categories.join(', ')}

REQUIREMENTS:
1. Each idea should be unique and innovative
2. Focus on problems people actually have
3. Ideas should be buildable as small web apps
4. Consider current trends and user needs
5. Variety across different categories

OUTPUT FORMAT (JSON ONLY, NO MARKDOWN):
{
  "ideas": [
    {
      "name": "App Name",
      "description": "Clear description of what it does",
      "category": "one of: ${this.config.categories.join(', ')}",
      "targetAudience": "who would use this",
      "uniqueValue": "what makes this special/different",
      "estimatedComplexity": "simple|medium|complex"
    }
  ]
}

RESPOND WITH VALID JSON ONLY.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const ideas: CreativeIdea[] = parsed.ideas.map((idea: any) => ({
        id: this.generateId(),
        ...idea,
        timestamp: new Date().toISOString(),
      }));

      return ideas;
    } catch (error) {
      console.error('Failed to generate ideas:', error);
      return [];
    }
  }

  /**
   * Generate mini-app code using Gemini
   */
  private async generateMiniAppCode(
    idea: CreativeIdea
  ): Promise<GeneratedMiniApp> {
    const prompt = `You are an expert web developer. Generate a complete, working mini-app based on this idea:

IDEA:
Name: ${idea.name}
Description: ${idea.description}
Category: ${idea.category}
Target Audience: ${idea.targetAudience}

TASK:
Generate a complete, working mini-app with:
1. Clean, modern HTML
2. Beautiful CSS (use modern design principles)
3. Functional JavaScript (vanilla JS or simple React)
4. Mobile-responsive design
5. Professional UI/UX

TECHNICAL REQUIREMENTS:
- Self-contained (no external dependencies except CDN if needed)
- Works immediately when opened in browser
- Include comments explaining key parts
- Use modern ES6+ JavaScript
- Beautiful, iOS-style design

OUTPUT FORMAT (JSON ONLY, NO MARKDOWN):
{
  "name": "${idea.name}",
  "description": "${idea.description}",
  "category": "${idea.category}",
  "technicalApproach": "Brief explanation of how it works",
  "features": ["feature1", "feature2", "feature3"],
  "code": {
    "html": "complete HTML code",
    "css": "complete CSS code",
    "javascript": "complete JavaScript code"
  }
}

RESPOND WITH VALID JSON ONLY. MAKE SURE ALL CODE IS COMPLETE AND FUNCTIONAL.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const miniApp: GeneratedMiniApp = {
        id: this.generateId(),
        name: parsed.name,
        description: parsed.description,
        category: parsed.category,
        code: parsed.code,
        technicalApproach: parsed.technicalApproach,
        features: parsed.features,
        timestamp: new Date().toISOString(),
      };

      return miniApp;
    } catch (error) {
      console.error('Failed to generate mini-app code:', error);
      throw error;
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Extract text from HTML (basic)
   */
  private extractTextFromHtml(html: string): string {
    // Remove script and style tags
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, ' ');

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get next cron run time
   */
  private getNextRunTime(): string {
    // This is approximate - cron doesn't provide exact next run
    return 'Next scheduled run (check cron schedule)';
  }
}

export default GeminiCreativeAgent;
