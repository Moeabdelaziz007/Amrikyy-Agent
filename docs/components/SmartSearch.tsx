import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';

interface SearchResult {
  title: string;
  path: string;
  category: string;
  excerpt: string;
  relevance: number;
}

export const SmartSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<string[]>([]);

  const searchDocumentation = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    // AI-powered search implementation
    const mockResults: SearchResult[] = [
      {
        title: 'GEMINI Integration Guide',
        path: 'docs/agents/gemini/GEMINI.md',
        category: 'agents',
        excerpt: 'Complete guide for Gemini 2.5 Pro integration...',
        relevance: 95
      }
    ];

    setResults(mockResults.filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchDocumentation(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="smart-search">
      <div className="search-header">
        <Search className="w-5 h-5" />
        <h2>Smart Documentation Search</h2>
      </div>
      
      <div className="search-input">
        <input
          type="text"
          placeholder="Search documentation..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-field"
        />
        <Filter className="w-4 h-4" />
      </div>
      
      <div className="search-results">
        {results.map((result, index) => (
          <div key={index} className="search-result">
            <div className="result-header">
              <BookOpen className="w-4 h-4" />
              <h3>{result.title}</h3>
              <span className="relevance">{result.relevance}%</span>
            </div>
            <p className="result-excerpt">{result.excerpt}</p>
            <div className="result-meta">
              <span className="category">{result.category}</span>
              <span className="path">{result.path}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
