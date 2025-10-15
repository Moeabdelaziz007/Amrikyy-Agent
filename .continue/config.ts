/**
 * Continue Advanced Configuration
 * 
 * This file provides advanced configuration for Continue AI assistant
 * with Gemini and z.ai integration, pattern learning, and multi-model orchestration.
 */

export function modifyConfig(config: Config): Config {
  // ============================================
  // PATTERN LEARNING INTEGRATION
  // ============================================
  
  config.experimental = {
    ...config.experimental,
    
    // Track accepted suggestions for pattern learning
    trackAcceptedSuggestions: true,
    
    // Learn from user's coding patterns
    patternLearning: {
      enabled: true,
      trackingMode: "comprehensive",
      learningRate: "adaptive",
      
      // What to learn
      patterns: [
        "naming_conventions",
        "code_structure",
        "import_patterns",
        "function_signatures",
        "error_handling",
        "documentation_style",
        "testing_patterns",
        "architecture_preferences"
      ],
      
      // How to apply learning
      application: {
        autocomplete: true,
        suggestions: true,
        refactoring: true,
        codeGeneration: true
      }
    },
    
    // Multi-model orchestration
    modelOrchestration: {
      enabled: true,
      
      // Automatic model selection based on task
      autoSelect: true,
      
      // Task-to-model mapping
      taskMapping: {
        "architecture": "Gemini Pro",
        "implementation": "Gemini Flash",
        "refactoring": "Gemini Pro",
        "documentation": "Gemini Flash",
        "debugging": "Gemini Pro",
        "testing": "Gemini Flash",
        "optimization": "Gemini Pro",
        "explanation": "Gemini Flash",
        "security": "z.ai Assistant",
        "complex_logic": "Gemini Pro"
      },
      
      // Fallback strategy
      fallback: {
        primary: "Gemini Pro",
        secondary: "Gemini Flash",
        tertiary: "z.ai Assistant"
      }
    },
    
    // Context-aware assistance
    contextAwareness: {
      enabled: true,
      
      // What context to consider
      sources: [
        "current_file",
        "related_files",
        "git_history",
        "project_structure",
        "dependencies",
        "documentation",
        "recent_edits",
        "user_patterns"
      ],
      
      // How to use context
      usage: {
        autocomplete: true,
        suggestions: true,
        explanations: true,
        refactoring: true
      }
    }
  };
  
  // ============================================
  // CUSTOM CONTEXT PROVIDERS
  // ============================================
  
  config.contextProviders = [
    ...config.contextProviders,
    
    // Pattern Learning Context
    {
      name: "pattern-learning",
      params: {
        source: ".cursor/learning-config.json",
        enabled: true
      }
    },
    
    // User Preferences Context
    {
      name: "user-preferences",
      params: {
        source: ".cursor/personal-ai-profile.json",
        enabled: true
      }
    },
    
    // AI Team Context
    {
      name: "ai-team",
      params: {
        source: ".cursor/ai-team-framework.json",
        enabled: true
      }
    },
    
    // Secret Sauce Context
    {
      name: "secret-sauce",
      params: {
        source: ".cursor/SECRET_SAUCE_WORKFLOW.md",
        enabled: true
      }
    }
  ];
  
  // ============================================
  // CUSTOM SLASH COMMANDS
  // ============================================
  
  config.slashCommands = [
    ...config.slashCommands,
    
    // Continue + Cline synergy commands
    {
      name: "explore-then-execute",
      description: "Continue explores, then Cline executes",
      prompt: "First, explore and analyze: {{{ input }}}. Then, create an execution plan for Cline to implement."
    },
    
    {
      name: "suggest-then-implement",
      description: "Continue suggests, then Cline implements",
      prompt: "Suggest improvements for: {{{ input }}}. Then, create implementation steps for Cline."
    },
    
    {
      name: "review-then-fix",
      description: "Continue reviews, then Cline fixes",
      prompt: "Review this code for issues: {{{ input }}}. Then, create fix instructions for Cline."
    },
    
    // Pattern learning commands
    {
      name: "learn-pattern",
      description: "Learn from this code pattern",
      prompt: "Analyze and learn the patterns in: {{{ input }}}. Store for future use."
    },
    
    {
      name: "apply-pattern",
      description: "Apply learned patterns",
      prompt: "Apply learned patterns to: {{{ input }}}"
    },
    
    // Multi-model commands
    {
      name: "best-model",
      description: "Use best model for task",
      prompt: "Select the best model and process: {{{ input }}}"
    },
    
    // Team coordination commands
    {
      name: "team-task",
      description: "Delegate to AI team",
      prompt: "Coordinate with AI team to: {{{ input }}}"
    }
  ];
  
  // ============================================
  // AUTOCOMPLETE ENHANCEMENT
  // ============================================
  
  config.tabAutocompleteOptions = {
    ...config.tabAutocompleteOptions,
    
    // Use pattern learning for autocomplete
    usePatternLearning: true,
    
    // Multi-line suggestions
    multilineCompletions: "always",
    
    // Debounce for performance
    debounceDelay: 300,
    
    // Max suggestions
    maxPromptTokens: 2048,
    
    // Disable in certain files
    disableInFiles: [
      "*.md",
      "*.txt",
      "*.json",
      "package-lock.json",
      "yarn.lock"
    ]
  };
  
  // ============================================
  // PERFORMANCE OPTIMIZATION
  // ============================================
  
  config.performance = {
    // Cache responses
    cacheEnabled: true,
    cacheTTL: 3600, // 1 hour
    
    // Parallel requests
    parallelRequests: 3,
    
    // Request timeout
    timeout: 30000, // 30 seconds
    
    // Retry strategy
    retry: {
      maxAttempts: 3,
      backoff: "exponential"
    }
  };
  
  return config;
}
