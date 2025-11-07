"use client";

import { Sixtyfour } from "next/font/google";
import { useState, useRef, useEffect } from "react";

const sixtyfour = Sixtyfour({
  subsets: ["latin"],
  weight: "400",
});

export default function Home() {
  const [isVisible, setIsVisible] = useState(true);
  const [inputWidth, setInputWidth] = useState('w-[600px]');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState(-1);
  const [currentQuery, setCurrentQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<(HTMLDivElement | null)[]>([]);

  const performSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/search?q=BACKEND%20${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value.trim();
      if (query && !isLoading) {
        setCurrentQuery(query);
        setSelectedResult(-1);
        await performSearch(query);
        setIsVisible(false);
        setInputWidth('w-[1200px]');
        setShowResults(true);
        e.currentTarget?.blur();
      }
    } else if (e.key === 'Escape' && showResults) {
      clearSearch();
    } else if (showResults && searchResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedResult(prev => Math.min(prev + 1, searchResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedResult(prev => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && selectedResult >= 0) {
        e.preventDefault();
        const result = searchResults[selectedResult];
        if (result.url) window.open(result.url, '_blank');
      }
    }
  };

  const clearSearch = () => {
    setShowResults(false);
    setIsVisible(true);
    setInputWidth('w-[600px]');
    setSearchResults([]);
    setError(null);
    setSelectedResult(-1);
    setCurrentQuery('');
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (selectedResult >= 0 && resultRefs.current[selectedResult]) {
      resultRefs.current[selectedResult]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedResult]);

  return (
    <div className={`min-h-screen bg-black custom-grid-bg ${showResults ? '' : 'flex items-center justify-center flex-col'}`}>
      {showResults && (
        <div className="pt-8 pb-4 flex justify-center">
          <div className={`relative ${inputWidth} max-w-2xl`}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="search"
              placeholder="Ask or Search"
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-12 py-3 bg-gray-800 text-white border border-gray-600 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder-gray-400"
              defaultValue={currentQuery}
            />
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className={`flex items-center justify-center flex-col ${showResults ? 'mt-8' : ''}`}>
        {isVisible && <h1 className={`${sixtyfour.className} text-white text-7xl font-bold mb-8`}>GridLock</h1>}

        {showResults ? (
          <div className="w-full max-w-4xl space-y-4">
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {!isLoading && !error && searchResults.length === 0 && currentQuery && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">No results found for "{currentQuery}"</p>
              </div>
            )}

            {!isLoading && !error && searchResults.length > 0 && (
              <>
                <div className="space-y-3">
                  {searchResults.slice(0, 10).map((result, index) => (
                  <div
                    key={index}
                    ref={el => { resultRefs.current[index] = el; }}
                    onClick={() => result.url && window.open(result.url, '_blank')}
                    className={`group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 transition-all duration-200 cursor-pointer ${
                      selectedResult === index ? 'ring-2 ring-blue-500 bg-gray-700/70' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg mb-2 transition-colors line-clamp-2">
                          {result.title}
                        </h3>
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex items-center text-gray-400 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="truncate transition-colors">
                              {result.url}
                            </span>
                          </div>
                        </div>
                        {result.desc && (
                          <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                            {result.desc}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
                <div className="text-center mt-6 mb-6">
                  <p className="text-gray-400 text-sm">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for <span className="text-blue-400 font-medium">"{currentQuery}"</span>
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className={`relative ${inputWidth} max-w-2xl`}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="search"
              placeholder="Ask or Search"
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder-gray-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}
