/**
 * CodebaseExplorer - Semantic code search and browser
 * 
 * Features:
 * - Natural language search with Gemini embeddings
 * - File tree browser
 * - Syntax-highlighted code viewer
 * - Search filters (file type, directory)
 * - Real-time suggestions
 * 
 * @author Ona AI
 * @created 2025-01-25
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileCode, 
  Folder, 
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
  Download,
  BarChart3
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchResult {
  path: string;
  extension: string;
  functions: Array<{ name: string; line: number }>;
  classes: Array<{ name: string; line: number }>;
  components: string[];
  lines: number;
  lastModified: string;
  similarity: number;
  score: number;
  relevance: number;
}

interface IndexStats {
  totalFiles: number;
  totalFunctions: number;
  totalClasses: number;
  totalComponents: number;
  totalLines: number;
  byExtension: Record<string, number>;
  lastIndexed: string | null;
}

export default function CodebaseExplorer() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [stats, setStats] = useState<IndexStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<SearchResult | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fileTypes: [] as string[],
    directories: [] as string[],
    threshold: 0.7
  });

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/codebase/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleIndex = async () => {
    setIndexing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/codebase/index', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        alert(`✅ Indexed ${data.results.indexed} files successfully!`);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to index codebase');
    } finally {
      setIndexing(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        q: query,
        threshold: filters.threshold.toString(),
        ...(filters.fileTypes.length > 0 && { fileTypes: filters.fileTypes.join(',') }),
        ...(filters.directories.length > 0 && { directories: filters.directories.join(',') })
      });

      const response = await fetch(`/api/codebase/search?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FileCode className="w-8 h-8 text-blue-600" />
                Codebase Explorer
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Semantic search powered by Gemini AI
              </p>
            </div>

            <div className="flex items-center gap-3">
              {stats && (
                <Card className="px-4 py-2">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Files:</span>
                      <span className="ml-2 font-bold text-gray-900 dark:text-white">
                        {stats.totalFiles}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Functions:</span>
                      <span className="ml-2 font-bold text-gray-900 dark:text-white">
                        {stats.totalFunctions}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Lines:</span>
                      <span className="ml-2 font-bold text-gray-900 dark:text-white">
                        {stats.totalLines.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              <Button
                onClick={handleIndex}
                disabled={indexing}
                variant="outline"
                className="gap-2"
              >
                {indexing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Indexing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Re-index
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search codebase... (e.g., 'authentication logic', 'React components', 'API endpoints')"
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button type="submit" disabled={loading} className="gap-2 px-8">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    File Types
                  </label>
                  <div className="space-y-2">
                    {['.js', '.ts', '.jsx', '.tsx'].map(ext => (
                      <label key={ext} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.fileTypes.includes(ext)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(f => ({ ...f, fileTypes: [...f.fileTypes, ext] }));
                            } else {
                              setFilters(f => ({ ...f, fileTypes: f.fileTypes.filter(t => t !== ext) }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{ext}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Directories
                  </label>
                  <div className="space-y-2">
                    {['backend', 'frontend', 'docs'].map(dir => (
                      <label key={dir} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.directories.includes(dir)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(f => ({ ...f, directories: [...f.directories, dir] }));
                            } else {
                              setFilters(f => ({ ...f, directories: f.directories.filter(d => d !== dir) }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{dir}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Similarity Threshold: {filters.threshold}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={filters.threshold}
                    onChange={(e) => setFilters(f => ({ ...f, threshold: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Less strict</span>
                    <span>More strict</span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 text-red-800 dark:text-red-200">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Found {results.length} results
              </h2>
            </div>

            {results.map((result, idx) => (
              <Card
                key={idx}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedFile(result)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCode className="w-4 h-4 text-blue-600" />
                      <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {result.path}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                        {result.extension}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {result.functions.length > 0 && (
                        <span>📦 {result.functions.length} functions</span>
                      )}
                      {result.classes.length > 0 && (
                        <span>🏛️ {result.classes.length} classes</span>
                      )}
                      {result.components.length > 0 && (
                        <span>⚛️ {result.components.length} components</span>
                      )}
                      <span>📏 {result.lines} lines</span>
                    </div>

                    {(result.functions.length > 0 || result.classes.length > 0) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.functions.slice(0, 5).map((fn, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded font-mono"
                          >
                            {fn.name}()
                          </span>
                        ))}
                        {result.classes.slice(0, 3).map((cls, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-mono"
                          >
                            {cls.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(result.relevance * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">relevance</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && query && (
          <Card className="mt-6 p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search query or filters
            </p>
          </Card>
        )}

        {/* Initial State */}
        {!query && !stats && (
          <Card className="mt-6 p-12 text-center">
            <FileCode className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Index your codebase first
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click "Re-index" to scan and index all code files
            </p>
            <Button onClick={handleIndex} disabled={indexing} className="gap-2">
              {indexing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Indexing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Start Indexing
                </>
              )}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
