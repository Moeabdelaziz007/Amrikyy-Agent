/**
 * AI UI Dashboard - Kombai-like UI Enhancement Tool
 * 
 * This dashboard provides AI-powered UI generation and enhancement capabilities
 * similar to Kombai, allowing users to create and improve UI components
 * using natural language descriptions and AI suggestions.
 * 
 * @author CURSERO AI
 * @created 2025-10-22
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Star, 
  Palette, 
  Code, 
  Eye, 
  Download, 
  Copy, 
  RefreshCw,
  Sparkles,
  Wand2,
  Layers,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle,
  AlertCircle,
  Info,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { AIButton, AICard, AIModal, AIInput, AIToast, AILoading } from '@/components/ui/AIEnhancedComponents';
import { generateUIComponent, enhanceUIComponent, getDesignPatterns } from '@/lib/ai-ui-generator';

// ============================================
// TYPES
// ============================================

interface UIComponentDescription {
  name: string;
  description: string;
  category: 'layout' | 'interaction' | 'display' | 'navigation' | 'form' | 'feedback';
  complexity: 'simple' | 'medium' | 'complex';
  accessibility: boolean;
  responsive: boolean;
  theme: 'light' | 'dark' | 'auto';
  animations: boolean;
}

interface GeneratedComponent {
  id: string;
  name: string;
  description: string;
  code: string;
  improvements: string[];
  accessibility: string[];
  performance: string[];
  responsive: string[];
  preview: React.ReactNode;
  createdAt: Date;
}

// ============================================
// COMPONENT TEMPLATES
// ============================================

const COMPONENT_TEMPLATES: UIComponentDescription[] = [
  {
    name: 'Hero Section',
    description: 'A modern hero section with gradient background and call-to-action buttons',
    category: 'layout',
    complexity: 'medium',
    accessibility: true,
    responsive: true,
    theme: 'auto',
    animations: true
  },
  {
    name: 'Pricing Card',
    description: 'A pricing card with glassmorphism effect and hover animations',
    category: 'display',
    complexity: 'simple',
    accessibility: true,
    responsive: true,
    theme: 'auto',
    animations: true
  },
  {
    name: 'Contact Form',
    description: 'A contact form with validation and success states',
    category: 'form',
    complexity: 'medium',
    accessibility: true,
    responsive: true,
    theme: 'auto',
    animations: true
  },
  {
    name: 'Navigation Bar',
    description: 'A responsive navigation bar with mobile menu and smooth transitions',
    category: 'navigation',
    complexity: 'medium',
    accessibility: true,
    responsive: true,
    theme: 'auto',
    animations: true
  },
  {
    name: 'Feature Grid',
    description: 'A grid layout showcasing features with icons and descriptions',
    category: 'layout',
    complexity: 'simple',
    accessibility: true,
    responsive: true,
    theme: 'auto',
    animations: true
  },
  {
    name: 'Testimonial Card',
    description: 'A testimonial card with user avatar and rating stars',
    category: 'display',
    complexity: 'simple',
    accessibility: true,
    responsive: true,
    theme: 'auto',
    animations: true
  }
];

// ============================================
// MAIN COMPONENT
// ============================================

const AIUIDashboard: React.FC = () => {
  // ==================== State ====================
  
  const [selectedTemplate, setSelectedTemplate] = useState<UIComponentDescription | null>(null);
  const [customDescription, setCustomDescription] = useState('');
  const [generatedComponents, setGeneratedComponents] = useState<GeneratedComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<GeneratedComponent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [designPatterns, setDesignPatterns] = useState(getDesignPatterns());
  const [activeTab, setActiveTab] = useState<'generate' | 'enhance' | 'patterns'>('generate');

  // ==================== Effects ====================

  useEffect(() => {
    // Load saved components from localStorage
    const saved = localStorage.getItem('ai-ui-components');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGeneratedComponents(parsed.map((comp: any) => ({
          ...comp,
          createdAt: new Date(comp.createdAt)
        })));
      } catch (error) {
        console.error('Failed to load saved components:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save components to localStorage
    localStorage.setItem('ai-ui-components', JSON.stringify(generatedComponents));
  }, [generatedComponents]);

  // ==================== Handlers ====================

  const handleGenerateComponent = async () => {
    if (!selectedTemplate && !customDescription.trim()) {
      setToast({ message: 'Please select a template or enter a custom description', type: 'error' });
      return;
    }

    setIsGenerating(true);

    try {
      const description = selectedTemplate || {
        name: 'Custom Component',
        description: customDescription,
        category: 'layout' as const,
        complexity: 'medium' as const,
        accessibility: true,
        responsive: true,
        theme: 'auto' as const,
        animations: true
      };

      const enhancement = generateUIComponent(description);
      
      const newComponent: GeneratedComponent = {
        id: Date.now().toString(),
        name: description.name,
        description: description.description,
        code: enhancement.code,
        improvements: enhancement.improvements,
        accessibility: enhancement.accessibility,
        performance: enhancement.performance,
        responsive: enhancement.responsive,
        preview: <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">Preview will be rendered here</div>,
        createdAt: new Date()
      };

      setGeneratedComponents(prev => [newComponent, ...prev]);
      setSelectedComponent(newComponent);
      setToast({ message: 'Component generated successfully!', type: 'success' });
      
      // Reset form
      setSelectedTemplate(null);
      setCustomDescription('');
    } catch (error) {
      console.error('Failed to generate component:', error);
      setToast({ message: 'Failed to generate component. Please try again.', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhanceComponent = async (component: GeneratedComponent) => {
    setIsGenerating(true);

    try {
      const enhancement = enhanceUIComponent(component.name, component.code);
      
      const enhancedComponent: GeneratedComponent = {
        ...component,
        code: enhancement.code,
        improvements: [...component.improvements, ...enhancement.improvements],
        accessibility: [...component.accessibility, ...enhancement.accessibility],
        performance: [...component.performance, ...enhancement.performance],
        responsive: [...component.responsive, ...enhancement.responsive]
      };

      setGeneratedComponents(prev => 
        prev.map(comp => comp.id === component.id ? enhancedComponent : comp)
      );
      setSelectedComponent(enhancedComponent);
      setToast({ message: 'Component enhanced successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to enhance component:', error);
      setToast({ message: 'Failed to enhance component. Please try again.', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setToast({ message: 'Code copied to clipboard!', type: 'success' });
  };

  const handleDownloadCode = (component: GeneratedComponent) => {
    const blob = new Blob([component.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${component.name.toLowerCase().replace(/\s+/g, '-')}.tsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToast({ message: 'Code downloaded successfully!', type: 'success' });
  };

  const handleDeleteComponent = (id: string) => {
    setGeneratedComponents(prev => prev.filter(comp => comp.id !== id));
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
    setToast({ message: 'Component deleted successfully!', type: 'success' });
  };

  // ==================== Render ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">AI UI Generator</h1>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Generate and enhance UI components using AI-powered design patterns and modern best practices
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'generate', label: 'Generate', icon: Sparkles },
            { id: 'enhance', label: 'Enhance', icon: Zap },
            { id: 'patterns', label: 'Patterns', icon: Layers }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Generation/Enhancement */}
        <div className="lg:col-span-1">
          <AICard className="p-6">
            {activeTab === 'generate' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Generate Component</h2>
                
                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Choose Template
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {COMPONENT_TEMPLATES.map(template => (
                      <button
                        key={template.name}
                        onClick={() => setSelectedTemplate(template)}
                        className={cn(
                          'p-3 rounded-lg text-left transition-all',
                          selectedTemplate?.name === template.name
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        )}
                      >
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm opacity-80">{template.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Or Enter Custom Description
                  </label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Describe the component you want to create..."
                    className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    rows={4}
                  />
                </div>

                {/* Generate Button */}
                <AIButton
                  onClick={handleGenerateComponent}
                  loading={isGenerating}
                  disabled={!selectedTemplate && !customDescription.trim()}
                  className="w-full"
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  {isGenerating ? 'Generating...' : 'Generate Component'}
                </AIButton>
              </div>
            )}

            {activeTab === 'enhance' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Enhance Component</h2>
                
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Select a component from the list to enhance it with AI suggestions.
                  </p>
                  
                  {generatedComponents.length === 0 ? (
                    <div className="text-center py-8">
                      <Code className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No components to enhance yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {generatedComponents.map(component => (
                        <button
                          key={component.id}
                          onClick={() => setSelectedComponent(component)}
                          className={cn(
                            'w-full p-3 rounded-lg text-left transition-all',
                            selectedComponent?.id === component.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          )}
                        >
                          <div className="font-medium">{component.name}</div>
                          <div className="text-sm opacity-80">
                            {component.improvements.length} enhancements
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'patterns' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Design Patterns</h2>
                
                <div className="space-y-4">
                  {designPatterns.map(pattern => (
                    <AICard key={pattern.name} className="p-4">
                      <h3 className="font-semibold text-white mb-2">{pattern.name}</h3>
                      <p className="text-sm text-gray-300 mb-3">{pattern.description}</p>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-blue-400">Best Practices:</span>
                          <ul className="text-xs text-gray-400 mt-1">
                            {pattern.bestPractices.map((practice, index) => (
                              <li key={index}>• {practice}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AICard>
                  ))}
                </div>
              </div>
            )}
          </AICard>
        </div>

        {/* Right Panel - Component List & Details */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-6">
            {/* Component List */}
            <AICard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Generated Components</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                    title="Toggle Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                    title="Toggle Code"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {generatedComponents.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Components Yet</h3>
                  <p className="text-gray-500">Generate your first component to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedComponents.map(component => (
                    <AICard
                      key={component.id}
                      className="p-4 cursor-pointer"
                      onClick={() => setSelectedComponent(component)}
                      interactive
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{component.name}</h3>
                          <p className="text-sm text-gray-300 mb-2">{component.description}</p>
                          <div className="flex gap-4 text-xs text-gray-400">
                            <span>{component.improvements.length} improvements</span>
                            <span>{component.accessibility.length} accessibility features</span>
                            <span>{component.performance.length} performance optimizations</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEnhanceComponent(component);
                            }}
                            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                            title="Enhance Component"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(component.code);
                            }}
                            className="p-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                            title="Copy Code"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadCode(component);
                            }}
                            className="p-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                            title="Download Code"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteComponent(component.id);
                            }}
                            className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                            title="Delete Component"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </AICard>
                  ))}
                </div>
              )}
            </AICard>

            {/* Component Details */}
            {selectedComponent && (
              <AICard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">{selectedComponent.name}</h3>
                
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  {[
                    { id: 'preview', label: 'Preview', icon: Eye },
                    { id: 'code', label: 'Code', icon: Code },
                    { id: 'improvements', label: 'Improvements', icon: CheckCircle },
                    { id: 'accessibility', label: 'Accessibility', icon: Info },
                    { id: 'performance', label: 'Performance', icon: Zap }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="space-y-4">
                  {activeTab === 'preview' && (
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      {selectedComponent.preview}
                    </div>
                  )}

                  {activeTab === 'code' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-white">Generated Code</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopyCode(selectedComponent.code)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            Copy Code
                          </button>
                          <button
                            onClick={() => handleDownloadCode(selectedComponent)}
                            className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{selectedComponent.code}</code>
                      </pre>
                    </div>
                  )}

                  {activeTab === 'improvements' && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">AI Improvements Applied</h4>
                      <ul className="space-y-2">
                        {selectedComponent.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-300">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === 'accessibility' && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Accessibility Features</h4>
                      <ul className="space-y-2">
                        {selectedComponent.accessibility.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-300">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === 'performance' && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Performance Optimizations</h4>
                      <ul className="space-y-2">
                        {selectedComponent.performance.map((optimization, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-300">
                            <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>{optimization}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AICard>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <AIToast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AICard className="p-8 text-center">
              <AILoading size="lg" variant="spinner" text="Generating component..." />
            </AICard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIUIDashboard;