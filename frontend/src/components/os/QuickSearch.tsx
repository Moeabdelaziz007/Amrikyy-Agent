/**
 * Quick Search Component - Universal OS Search
 * 
 * Features:
 * - Cmd+K / Ctrl+K keyboard shortcut
 * - Search apps, files, commands
 * - Fuzzy search algorithm
 * - Keyboard navigation (arrow keys)
 * - Recent searches with localStorage
 * - Fast and responsive
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Command,
  Folder,
  FileText,
  Settings,
  Clock,
  ArrowRight,
  Hash,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchResult {
  id: string
  type: 'app' | 'file' | 'command' | 'recent'
  title: string
  description?: string
  icon?: React.ReactNode
  action: () => void
  keywords?: string[]
}

interface QuickSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLaunchApp?: (appId: string) => void
  onExecuteCommand?: (command: string) => void
}

export function QuickSearch({ 
  open, 
  onOpenChange,
  onLaunchApp,
  onExecuteCommand 
}: QuickSearchProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('amrikyy_recent_searches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch (error) {
        console.error('Failed to load recent searches:', error)
      }
    }
  }, [])

  // Save recent search
  const saveRecentSearch = useCallback((search: string) => {
    if (!search.trim()) return
    
    const updated = [
      search,
      ...recentSearches.filter(s => s !== search)
    ].slice(0, 10) // Keep only 10 recent searches
    
    setRecentSearches(updated)
    localStorage.setItem('amrikyy_recent_searches', JSON.stringify(updated))
  }, [recentSearches])

  // Available applications
  const apps: SearchResult[] = [
    {
      id: 'maya-travel',
      type: 'app',
      title: 'Maya Travel Assistant',
      description: 'AI-powered travel planning',
      icon: <Sparkles className="w-4 h-4 text-primary" />,
      action: () => {
        onLaunchApp?.('maya-travel')
        saveRecentSearch('Maya Travel Assistant')
        onOpenChange(false)
      },
      keywords: ['maya', 'travel', 'ai', 'assistant', 'flight', 'hotel']
    },
    {
      id: 'trip-planner',
      type: 'app',
      title: 'Trip Planner',
      description: 'Multi-destination trip planning',
      icon: <Folder className="w-4 h-4 text-blue-500" />,
      action: () => {
        onLaunchApp?.('trip-planner')
        saveRecentSearch('Trip Planner')
        onOpenChange(false)
      },
      keywords: ['trip', 'planner', 'destination', 'itinerary', 'vacation']
    },
    {
      id: 'settings',
      type: 'app',
      title: 'Settings',
      description: 'System settings and preferences',
      icon: <Settings className="w-4 h-4 text-gray-500" />,
      action: () => {
        onLaunchApp?.('settings')
        saveRecentSearch('Settings')
        onOpenChange(false)
      },
      keywords: ['settings', 'preferences', 'theme', 'language', 'config']
    },
    {
      id: 'file-manager',
      type: 'app',
      title: 'File Manager',
      description: 'Manage your files and folders',
      icon: <Folder className="w-4 h-4 text-yellow-500" />,
      action: () => {
        onLaunchApp?.('file-manager')
        saveRecentSearch('File Manager')
        onOpenChange(false)
      },
      keywords: ['files', 'folder', 'documents', 'storage']
    },
    {
      id: 'terminal',
      type: 'app',
      title: 'Terminal',
      description: 'AI-powered command terminal',
      icon: <Command className="w-4 h-4 text-green-500" />,
      action: () => {
        onLaunchApp?.('terminal')
        saveRecentSearch('Terminal')
        onOpenChange(false)
      },
      keywords: ['terminal', 'command', 'shell', 'cli']
    }
  ]

  // System commands
  const commands: SearchResult[] = [
    {
      id: 'cmd-theme-toggle',
      type: 'command',
      title: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: <Hash className="w-4 h-4 text-purple-500" />,
      action: () => {
        onExecuteCommand?.('toggle-theme')
        saveRecentSearch('Toggle Theme')
        onOpenChange(false)
      },
      keywords: ['theme', 'dark', 'light', 'appearance']
    },
    {
      id: 'cmd-logout',
      type: 'command',
      title: 'Logout',
      description: 'Sign out of your account',
      icon: <Hash className="w-4 h-4 text-red-500" />,
      action: () => {
        onExecuteCommand?.('logout')
        saveRecentSearch('Logout')
        onOpenChange(false)
      },
      keywords: ['logout', 'sign out', 'exit']
    },
    {
      id: 'cmd-close-all',
      type: 'command',
      title: 'Close All Windows',
      description: 'Close all open windows',
      icon: <Hash className="w-4 h-4 text-orange-500" />,
      action: () => {
        onExecuteCommand?.('close-all-windows')
        saveRecentSearch('Close All Windows')
        onOpenChange(false)
      },
      keywords: ['close', 'windows', 'all']
    }
  ]

  // Fuzzy search algorithm
  const fuzzyMatch = (str: string, pattern: string): boolean => {
    const strLower = str.toLowerCase()
    const patternLower = pattern.toLowerCase()
    
    let patternIdx = 0
    let strIdx = 0
    
    while (patternIdx < patternLower.length && strIdx < strLower.length) {
      if (patternLower[patternIdx] === strLower[strIdx]) {
        patternIdx++
      }
      strIdx++
    }
    
    return patternIdx === patternLower.length
  }

  // Calculate match score for sorting
  const calculateScore = (result: SearchResult, query: string): number => {
    const queryLower = query.toLowerCase()
    const titleLower = result.title.toLowerCase()
    
    // Exact match gets highest score
    if (titleLower === queryLower) return 1000
    
    // Starts with query gets high score
    if (titleLower.startsWith(queryLower)) return 100
    
    // Contains query gets medium score
    if (titleLower.includes(queryLower)) return 50
    
    // Keyword match
    const keywordMatch = result.keywords?.some(k => 
      k.toLowerCase().includes(queryLower)
    )
    if (keywordMatch) return 25
    
    // Fuzzy match gets low score
    return fuzzyMatch(result.title, query) ? 10 : 0
  }

  // Filter and sort results
  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      // Show recent searches when no query
      const recents: SearchResult[] = recentSearches.map((search, index) => ({
        id: `recent-${index}`,
        type: 'recent',
        title: search,
        icon: <Clock className="w-4 h-4 text-muted-foreground" />,
        action: () => {
          setQuery(search)
        }
      }))
      
      return recents.length > 0 ? recents : apps.slice(0, 5)
    }

    const allResults = [...apps, ...commands]
    
    return allResults
      .map(result => ({
        result,
        score: calculateScore(result, query)
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ result }) => result)
      .slice(0, 8) // Show max 8 results
  }, [query, apps, commands, recentSearches])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredResults.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
          break
        case 'Enter':
          e.preventDefault()
          if (filteredResults[selectedIndex]) {
            filteredResults[selectedIndex].action()
          }
          break
        case 'Escape':
          e.preventDefault()
          onOpenChange(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, filteredResults, selectedIndex, onOpenChange])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredResults])

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Detect OS for keyboard shortcut display
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const modKey = isMac ? '⌘' : 'Ctrl'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0" showCloseButton={false}>
        {/* Header */}
        <DialogHeader className="p-4 pb-0 border-b-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg">Quick Search</DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Search apps, files, and commands
              </p>
            </div>
            <Badge variant="outline" className="gap-1 text-xs">
              <Command className="w-3 h-3" />
              {modKey}+K
            </Badge>
          </div>
        </DialogHeader>

        {/* Search Input */}
        <div className="p-4 pb-2">
          <Input
            ref={inputRef}
            placeholder="Type to search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-base h-12 pl-4"
          />
        </div>

        {/* Results */}
        <ScrollArea className="max-h-96">
          <div className="p-2">
            {filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {query ? 'No results found' : 'Start typing to search'}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-1">
                  {filteredResults.map((result, index) => (
                    <motion.button
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      onClick={result.action}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                        selectedIndex === index
                          ? 'bg-accent'
                          : 'hover:bg-accent/50'
                      )}
                    >
                      <div className="p-2 bg-background rounded-md">
                        {result.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {result.title}
                        </div>
                        {result.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {result.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {result.type === 'recent' && (
                          <Badge variant="outline" className="text-xs">Recent</Badge>
                        )}
                        {result.type === 'command' && (
                          <Badge variant="outline" className="text-xs">Command</Badge>
                        )}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">↵</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
          <div>
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default QuickSearch
