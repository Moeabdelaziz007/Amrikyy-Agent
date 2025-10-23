import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  MegaphoneIcon, BarChartBigIcon, LineChartIcon, PencilLineIcon, Share2Icon, RocketIcon, PieChartIcon
} from '../IconComponents';
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';

interface MarketingAgentUIProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
}

// Helper to check if the result is an object with text and optional groundingChunks
interface MarketingResult {
  text: string;
  groundingChunks?: Array<{ web?: { uri: string; title?: string }; maps?: { uri: string; title?: string } }>;
}

const isMarketingResult = (obj: any): obj is MarketingResult => {
  return typeof obj === 'object' && obj !== null && 'text' in obj;
};

const MarketingAgentUI: React.FC<MarketingAgentUIProps> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.agents.marketing[lang];
  const globalText = translations.global[lang];
  const currentThemeColors = theme.colors;

  // States for Market Research
  const [researchAudience, setResearchAudience] = useState('');
  const [researchProduct, setResearchProduct] = useState('');
  const [researchCompetitors, setResearchCompetitors] = useState('');

  // States for SEO Specialist
  const [seoProduct, setSeoProduct] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // States for Content Strategist
  const [contentTopic, setContentTopic] = useState('');
  const [contentAudience, setContentAudience] = useState('');

  // States for Social Media Manager
  const [socialPlatform, setSocialPlatform] = useState('');
  const [socialProduct, setSocialProduct] = useState('');

  // States for Campaign Manager
  const [campaignGoal, setCampaignGoal] = useState('');
  const [campaignBudget, setCampaignBudget] = useState('');
  const [campaignDuration, setCampaignDuration] = useState('');

  // States for Analytics Expert
  const [analyticsData, setAnalyticsData] = useState('');
  const [analyticsMetrics, setAnalyticsMetrics] = useState('');


  const [result, setResult] = useState<MarketingResult | string>(''); // Can be string or structured object
  const [isLoading, setIsLoading] = useState(false);

  const executeTask = async (
    taskKey: string, // Corresponds to key in currentText.tasks
    taskInput: Record<string, any>,
  ) => {
    setIsLoading(true);
    setResult('');
    try {
      const response = await fetch(`http://localhost:3000/api/agents/marketing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: taskKey, ...taskInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      // Expect data.result to be { text: string, groundingChunks?: any[] }
      const formattedOutput = data.result && isMarketingResult(data.result) ? data.result : { text: JSON.stringify(data) };

      setResult(formattedOutput);

      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'marketing',
        agentName: currentText.name,
        taskType: currentText.tasks[taskKey as keyof typeof currentText.tasks],
        taskInput: taskInput,
        taskOutput: formattedOutput.text, // Log only the text part to history for brevity
        timestamp: new Date().toISOString(),
        status: 'success',
      });
    } catch (error: any) {
      console.error('Marketing Agent task failed:', error);
      const errorMessage = `Error: ${error.message}`;
      setResult(errorMessage);
      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'marketing',
        agentName: currentText.name,
        taskType: currentText.tasks[taskKey as keyof typeof currentText.tasks],
        taskInput: taskInput,
        taskOutput: errorMessage,
        timestamp: new Date().toISOString(),
        status: 'error',
        errorMessage: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarketResearch = () => {
    if (!researchAudience || !researchProduct) return;
    executeTask('marketResearch', {
      targetAudience: researchAudience,
      productService: researchProduct,
      competitors: researchCompetitors,
    });
  };

  const handleSeoOptimization = () => {
    if (!seoProduct || !seoKeywords) return;
    executeTask('seoSpecialist', {
      productService: seoProduct,
      keywords: seoKeywords,
    });
  };

  const handleContentStrategy = () => {
    if (!contentTopic || !contentAudience) return;
    executeTask('contentStrategist', {
      topic: contentTopic,
      targetAudience: contentAudience,
    });
  };

  const handleSocialMediaManagement = () => {
    if (!socialPlatform || !socialProduct) return;
    executeTask('socialMediaManager', {
      platform: socialPlatform,
      productService: socialProduct,
    });
  };

  const handleCampaignLaunch = () => {
    if (!campaignGoal || !campaignBudget || !campaignDuration) return;
    executeTask('campaignManager', {
      campaignGoal: campaignGoal,
      budget: campaignBudget,
      duration: campaignDuration,
    });
  };

  const handleAnalyzeMarketingData = () => {
    if (!analyticsData || !analyticsMetrics) return;
    executeTask('analyticsExpert', {
      dataToAnalyze: analyticsData,
      metrics: analyticsMetrics,
    });
  };

  const inputClass = `w-full p-2 rounded-md border text-text bg-background focus:ring-2 focus:ring-primary focus:border-transparent`;
  const buttonClass = `w-full py-2 px-4 rounded-md text-white font-semibold bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`;

  const displayedResultText = typeof result === 'string' ? result : result.text;
  const displayedGroundingChunks = isMarketingResult(result) ? result.groundingChunks : [];


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-6 space-y-6 ${currentThemeColors.background}`}
      style={{ fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
    >
      <h3 className={`text-2xl font-bold flex items-center gap-2 text-text`} style={{ color: currentThemeColors.primary }}>
        <MegaphoneIcon className="w-6 h-6" /> {currentText.name}
      </h3>
      <p className={`text-text-secondary`}>{currentText.description}</p>

      {/* Market Research Analyst */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
          <BarChartBigIcon className="w-5 h-5" /> {currentText.tasks.marketResearch}
        </h4>
        <textarea
          placeholder={currentText.placeholders.targetAudience}
          value={researchAudience}
          onChange={(e) => setResearchAudience(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={2}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.productService}
          value={researchProduct}
          onChange={(e) => setResearchProduct(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.competitors}
          value={researchCompetitors}
          onChange={(e) => setResearchCompetitors(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleMarketResearch} disabled={isLoading || !researchAudience || !researchProduct} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.marketResearch}
        </button>
      </div>

      {/* SEO Specialist */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
          <LineChartIcon className="w-5 h-5" /> {currentText.tasks.seoSpecialist}
        </h4>
        <input
          type="text"
          placeholder={currentText.placeholders.productService}
          value={seoProduct}
          onChange={(e) => setSeoProduct(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <textarea
          placeholder={currentText.placeholders.keywords}
          value={seoKeywords}
          onChange={(e) => setSeoKeywords(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={2}
        />
        <button onClick={handleSeoOptimization} disabled={isLoading || !seoProduct || !seoKeywords} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.seoSpecialist}
        </button>
      </div>

      {/* Content Strategist */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
          <PencilLineIcon className="w-5 h-5" /> {currentText.tasks.contentStrategist}
        </h4>
        <input
          type="text"
          placeholder={currentText.placeholders.topic}
          value={contentTopic}
          onChange={(e) => setContentTopic(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <textarea
          placeholder={currentText.placeholders.targetAudience}
          value={contentAudience}
          onChange={(e) => setContentAudience(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={2}
        />
        <button onClick={handleContentStrategy} disabled={isLoading || !contentTopic || !contentAudience} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.contentStrategist}
        </button>
      </div>

      {/* Social Media Manager */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
          <Share2Icon className="w-5 h-5" /> {currentText.tasks.socialMediaManager}
        </h4>
        <input
          type="text"
          placeholder={currentText.placeholders.platform}
          value={socialPlatform}
          onChange={(e) => setSocialPlatform(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.productService}
          value={socialProduct}
          onChange={(e) => setSocialProduct(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleSocialMediaManagement} disabled={isLoading || !socialPlatform || !socialProduct} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.socialMediaManager}
        </button>
      </div>

      {/* Campaign Manager */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
          <RocketIcon className="w-5 h-5" /> {currentText.tasks.campaignManager}
        </h4>
        <input
          type="text"
          placeholder={currentText.placeholders.campaignGoal}
          value={campaignGoal}
          onChange={(e) => setCampaignGoal(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.budget}
          value={campaignBudget}
          onChange={(e) => setCampaignBudget(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.duration}
          value={campaignDuration}
          onChange={(e) => setCampaignDuration(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleCampaignLaunch} disabled={isLoading || !campaignGoal || !campaignBudget || !campaignDuration} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.campaignManager}
        </button>
      </div>

      {/* Analytics Expert */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
          <PieChartIcon className="w-5 h-5" /> {currentText.tasks.analyticsExpert}
        </h4>
        <textarea
          placeholder={currentText.placeholders.dataToAnalyze}
          value={analyticsData}
          onChange={(e) => setAnalyticsData(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={3}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.metrics}
          value={analyticsMetrics}
          onChange={(e) => setAnalyticsMetrics(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleAnalyzeMarketingData} disabled={isLoading || !analyticsData || !analyticsMetrics} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.analyticsExpert}
        </button>
      </div>

      {displayedResultText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg mt-4 shadow overflow-x-auto`}
          style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border, color: currentThemeColors.text }}
        >
          <h4 className="font-semibold mb-2">{globalText.output}:</h4>
          <pre className="whitespace-pre-wrap font-mono text-sm">{displayedResultText}</pre>

          {displayedGroundingChunks && displayedGroundingChunks.length > 0 && (
            <div className="mt-4 border-t pt-3" style={{ borderColor: currentThemeColors.border }}>
              <h5 className="font-semibold text-sm mb-2">Sources:</h5>
              <ul className="list-disc list-inside text-xs text-text-secondary">
                {displayedGroundingChunks.map((chunk, index) => (
                  chunk.web?.uri ? (
                    <li key={`web-source-${index}`}>
                      <a 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline"
                        style={{color: currentThemeColors.primary}}
                      >
                        {chunk.web.title || chunk.web.uri}
                      </a>
                    </li>
                  ) : chunk.maps?.uri ? (
                    <li key={`maps-source-${index}`}>
                      <a 
                        href={chunk.maps.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline"
                        style={{color: currentThemeColors.primary}}
                      >
                        {chunk.maps.title || chunk.maps.uri} (Maps)
                      </a>
                    </li>
                  ) : null
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default MarketingAgentUI;