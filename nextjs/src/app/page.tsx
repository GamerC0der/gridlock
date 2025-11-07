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
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [cards, setCards] = useState<Array<{id: number, x: number, y: number, content: string}>>([]);
  const [cardId, setCardId] = useState(0);
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPreview, setDragPreview] = useState<{ x: number, y: number } | null>(null);
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

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedCard !== null || e.target !== e.currentTarget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const snappedX = Math.floor(x / 160) * 160;
    const snappedY = Math.floor(y / 160) * 160;

    const existingCard = cards.find(card => card.x === snappedX && card.y === snappedY);
    if (!existingCard) {
      const newCard = {
        id: cardId,
        x: snappedX,
        y: snappedY,
        content: `Card ${cardId + 1}`
      };
      setCards(prev => [...prev, newCard]);
      setCardId(prev => prev + 1);
    }
  };

  const handleCardMouseDown = (e: React.MouseEvent<HTMLDivElement>, cardId: number) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (containerRect) {
      setDragOffset({
        x: e.clientX - containerRect.left - rect.left,
        y: e.clientY - containerRect.top - rect.top
      });
    }
    const card = cards.find(c => c.id === cardId);
    if (card) {
      setDragPreview({ x: card.x, y: card.y });
    }
    setDraggedCard(cardId);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedCard === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    const snappedX = Math.round(x / 160) * 160;
    const snappedY = Math.round(y / 160) * 160;

    setDragPreview({ x: snappedX, y: snappedY });
  };

  const handleMouseUp = () => {
    if (draggedCard !== null && dragPreview) {
      setCards(prev => prev.map(card =>
        card.id === draggedCard
          ? { ...card, x: dragPreview.x, y: dragPreview.y }
          : card
      ));
    }
    setDraggedCard(null);
    setDragPreview(null);
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
    <div
      className={`min-h-screen bg-black custom-grid-bg ${showResults ? '' : 'flex items-center justify-center flex-col'}`}
      onClick={handleGridClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <button
        onClick={() => setShowRightPanel(!showRightPanel)}
        className="fixed left-8 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center transition-all duration-200 z-10"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
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

      {showRightPanel && (
        <div className="fixed left-24 top-1/2 transform -translate-y-1/2 w-80 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-20">
          <div className="p-6">
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                placeholder="Search widgets..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder-gray-400"
              />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div onClick={() => setShowRightPanel(false)} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <div className="text-center">
                    <h3 className="text-white font-semibold text-lg mb-2">Clock</h3>
                    <div className="w-12 h-12 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,6 12,12 16,14"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>
                <div onClick={() => setShowRightPanel(false)} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <div className="text-center">
                    <h3 className="text-white font-semibold text-lg mb-2">Weather</h3>
                    <div className="w-12 h-12 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.9 5.002 5.002 0 00-9.8 1.1A4 4 0 003 15z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div onClick={() => setShowRightPanel(false)} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <div className="text-center">
                    <h3 className="text-white font-semibold text-lg mb-2">Wordle</h3>
                    <div className="w-12 h-12 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {cards.map(card => {
        const isDragging = draggedCard === card.id;
        const position = isDragging && dragPreview ? dragPreview : { x: card.x, y: card.y };

        return (
          <div
            key={card.id}
            className={`absolute bg-gray-800/90 backdrop-blur-sm border rounded-lg p-4 cursor-move select-none transition-opacity ${
              isDragging ? 'border-blue-400 shadow-lg opacity-80' : 'border-gray-600'
            }`}
            style={{
              left: position.x,
              top: position.y,
              width: '140px',
              height: '140px',
              zIndex: isDragging ? 50 : 10
            }}
            onMouseDown={(e) => handleCardMouseDown(e, card.id)}
          >
            <div className="text-white text-sm font-medium">{card.content}</div>
          </div>
        );
      })}
    </div>
  );
}
