/**
 * QuickSearch Component - Universal search (Cmd+K / Ctrl+K)
 * Features:
 * - Search apps, files, commands
 * - Fuzzy search with Fuse.js
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Recent searches with localStorage
 * - Beautiful animations with Framer Motion
 * 
 * @component
 * @example
 * ```tsx
 * <QuickSearch isOpen={isOpen} onClose={() => setIsOpen(false)} />
 * ```
 * 
 * @author CURSERO AI
 * @created 2025-10-22
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Command, 
  File, 
  Folder, 
  Terminal, 
  Settings,
  Clock,
  X,
  ArrowRight,
  Zap
} from 'lucide-react';
import Fuse from 'fuse.js';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type SearchItemType = 'app' | 'file' | 'command' | 'recent';

export interface SearchItem {
  id: string;
  title: string;
  description?: string;
  type: SearchItemType;
  icon?: React.ReactNode;
  action?: () => void;
  category?: string;
  keywords?: string[];
}

export interface QuickSearchProps {
  isOpen: boolean;
  onClose: () => void;
  items?: SearchItem[];
  placeholder?: string;
  maxResults?: number;
  className?: string;
}

// ============================================
// DEFAULT ITEMS (Demo Data)
// ============================================

const DEFAULT_ITEMS: SearchItem[] = [
  // Apps
  {
    id: 'app-maya',
    title: 'Maya Travel Assistant',
    description: 'AI-powered travel planning',
    type: 'app',
    icon: <Zap className="w-4 h-4" />,
    category: 'Applications',
    keywords: ['travel', 'ai', 'assistant', 'maya']
  },
  {
    id: 'app-terminal',
    title: 'Terminal',
    description: 'Command line interface',
    type: 'app',
    icon: <Terminal className="w-4 h-4" />,
    category: 'Applications',
    keywords: ['terminal', 'console', 'shell', 'cli']
  },
  {
    id: 'app-settings',
    title: 'Settings',
    description: 'System preferences',
    type: 'app',
    icon: <Settings className="w-4 h-4" />,
    category: 'Applications',
    keywords: ['settings', 'preferences', 'config']
  },
  // Commands
  {
    id: 'cmd-new-window',
    title: 'New Window',
    description: 'Cmd+N',
    type: 'command',
    icon: <Command className="w-4 h-4" />,
    category: 'Commands',
    keywords: ['new', 'window', 'create']
  },
  {
    id: 'cmd-close-window',
    title: 'Close Window',
    description: 'Cmd+W',
    type: 'command',
    icon: <Command className="w-4 h-4" />,
    category: 'Commands',
    keywords: ['close', 'window', 'exit']
  },
  {
    id: 'cmd-minimize',
    title: 'Minimize Window',
    description: 'Cmd+M',
    type: 'command',
    icon: <Command className="w-4 h-4" />,
    category: 'Commands',
    keywords: ['minimize', 'window', 'hide']
  },
  // Files
  {
    id: 'file-documents',
    title: 'Documents',
    description: 'Personal documents folder',
    type: 'file',
    icon: <Folder className="w-4 h-4" />,
    category: 'Files',
    keywords: ['documents', 'folder', 'files']
  },
  {
    id: 'file-downloads',
    title: 'Downloads',
    description: 'Downloaded files',
    type: 'file',
    icon: <Folder className="w-4 h-4" />,
    category: 'Files',
    keywords: ['downloads', 'folder', 'files']
  }
];

// ============================================
// LOCAL STORAGE KEYS
// ============================================

const RECENT_SEARCHES_KEY = 'amrikyy-recent-searches';
const MAX_RECENT_SEARCHES = 5;

// ============================================
// COMPONENT
// ============================================

export function QuickSearch({
  isOpen,
  onClose,
  items = DEFAULT_ITEMS,
  placeholder = 'Search apps, files, and commands...',
  maxResults = 8,
  className
}: QuickSearchProps) {
  
  // ==================== State ====================
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<SearchItem[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // ==================== Fuse.js Configuration ====================
  
  const fuse = useRef(new Fuse(items, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'description', weight: 1 },
      { name: 'keywords', weight: 1.5 },
      { name: 'category', weight: 0.5 }
    ],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 1
  }));
  
  // ==================== Effects ====================
  
  /**
   * Focus input when opened
   */
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      loadRecentSearches();
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);
  
  /**
   * Update Fuse index when items change
   */
  useEffect(() => {
    fuse.current.setCollection(items);
  }, [items]);
  
  /**
   * Perform fuzzy search
   */
  useEffect(() => {
    if (query.trim()) {
      const searchResults = fuse.current.search(query);
      const formattedResults = searchResults
        .slice(0, maxResults)
        .map(result => result.item);
      setResults(formattedResults);
      setSelectedIndex(0);
    } else {
      // Show recent searches when no query
      setResults(recentSearches.slice(0, maxResults));
      setSelectedIndex(0);
    }
  }, [query, maxResults, recentSearches]);
  
  /**
   * Scroll selected item into view
   */
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex, results.length]);
  
  // ==================== Handlers ====================
  
  /**
   * Load recent searches from localStorage
   */
  const loadRecentSearches = useCallback(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentSearches(parsed);
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);
  
  /**
   * Save to recent searches
   */
  const saveToRecentSearches = useCallback((item: SearchItem) => {
    try {
      const updated = [
        item,
        ...recentSearches.filter(r => r.id !== item.id)
      ].slice(0, MAX_RECENT_SEARCHES);
      
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  }, [recentSearches]);
  
  /**
   * Handle item selection
   */
  const handleSelect = useCallback((item: SearchItem) => {
    // Save to recent searches
    saveToRecentSearches(item);
    
    // Execute action if exists
    item.action?.();
    
    // Close search
    onClose();
    setQuery('');
  }, [onClose, saveToRecentSearches]);
  
  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
        
      default:
        break;
    }
  }, [results, selectedIndex, handleSelect, onClose]);
  
  /**
   * Handle backdrop click
   */
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);
  
  // ==================== Get Icon ====================
  
  const getIcon = (item: SearchItem) => {
    if (item.icon) return item.icon;
    
    switch (item.type) {
      case 'app':
        return <Zap className="w-4 h-4" />;
      case 'file':
        return <File className="w-4 h-4" />;
      case 'command':
        return <Command className="w-4 h-4" />;
      case 'recent':
        return <Clock className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };
  
  // ==================== Render ====================
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={handleBackdropClick}
          />
          
          {/* Search Modal */}
          <div className="fixed inset-0 flex items-start justify-center pt-[20vh] z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                'w-full max-w-2xl mx-4',
                'bg-slate-900/95 backdrop-blur-xl',
                'border border-white/10 rounded-2xl',
                'shadow-2xl overflow-hidden',
                className
              )}
            >
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="
                    w-full py-4 pl-12 pr-12
                    bg-transparent
                    text-white text-lg
                    placeholder:text-gray-500
                    outline-none
                    border-b border-white/10
                  "
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="
                      absolute right-4 top-1/2 -translate-y-1/2
                      p-1 rounded-md
                      hover:bg-white/10
                      transition-colors
                      text-gray-400 hover:text-white
                    "
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Results */}
              <div 
                ref={resultsRef}
                className="max-h-[400px] overflow-y-auto py-2"
              >
                {results.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    {query ? 'No results found' : 'Type to search...'}
                  </div>
                ) : (
                  <>
                    {!query && recentSearches.length > 0 && (
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Recent Searches
                      </div>
                    )}
                    
                    {results.map((item, index) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          'w-full px-4 py-3',
                          'flex items-center gap-3',
                          'text-left',
                          'transition-colors',
                          index === selectedIndex
                            ? 'bg-blue-500/20 border-l-2 border-blue-500'
                            : 'hover:bg-white/5'
                        )}
                      >
                        {/* Icon */}
                        <div className={cn(
                          'flex-shrink-0 p-2 rounded-lg',
                          index === selectedIndex
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-white/5 text-gray-400'
                        )}>
                          {getIcon(item)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">
                            {item.title}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-400 truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                        
                        {/* Category */}
                        {item.category && (
                          <div className="text-xs text-gray-500 px-2 py-1 rounded bg-white/5">
                            {item.category}
                          </div>
                        )}
                        
                        {/* Arrow */}
                        {index === selectedIndex && (
                          <ArrowRight className="w-4 h-4 text-blue-400" />
                        )}
                      </motion.button>
                    ))}
                  </>
                )}
              </div>
              
              {/* Footer */}
              <div className="px-4 py-3 border-t border-white/10 bg-slate-950/50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">↑</kbd>
                      <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">↵</kbd>
                      Select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">Esc</kbd>
                      Close
                    </span>
                  </div>
                  <div>
                    {results.length} result{results.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default QuickSearch;
