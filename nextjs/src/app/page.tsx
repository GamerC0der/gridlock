"use client";

import { Sixtyfour } from "next/font/google";
import { useState, useRef, useEffect, memo } from "react";

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
  const [cards, setCards] = useState<Array<{id: number, x: number, y: number, content: string, type?: string, width?: number, height?: number, url?: string}>>([]);
  const [cardId, setCardId] = useState(0);
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPreview, setDragPreview] = useState<{ x: number, y: number } | null>(null);
  const [placementPreview, setPlacementPreview] = useState<{ x: number, y: number } | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [placementMode, setPlacementMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState<any>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; cardId: number } | null>(null);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [favoriteName, setFavoriteName] = useState('');
  const [favoriteUrl, setFavoriteUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<(HTMLDivElement | null)[]>([]);

  const Clock = ({ size = 120 }: { size?: number }) => {
    const hours = currentTime.getHours() % 12;
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();

    const hourAngle = (hours * 30) + (minutes * 0.5);
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    const timeString = currentTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    return (
      <div className="flex flex-col items-center justify-center h-full">

        <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 200 200" className="drop-shadow-sm">
          <circle cx="100" cy="100" r="95" fill="none" stroke="white" strokeWidth="2"/>
          <circle cx="100" cy="100" r="2" fill="white"/>
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) - 90;
            const radian = (angle * Math.PI) / 180;
            const x1 = 100 + 80 * Math.cos(radian);
            const y1 = 100 + 80 * Math.sin(radian);
            const x2 = 100 + 90 * Math.cos(radian);
            const y2 = 100 + 90 * Math.sin(radian);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          <line
            x1="100"
            y1="100"
            x2={100 + 50 * Math.cos((hourAngle - 90) * Math.PI / 180)}
            y2={100 + 50 * Math.sin((hourAngle - 90) * Math.PI / 180)}
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="100"
            y1="100"
            x2={100 + 70 * Math.cos((minuteAngle - 90) * Math.PI / 180)}
            y2={100 + 70 * Math.sin((minuteAngle - 90) * Math.PI / 180)}
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="100"
            y1="100"
            x2={100 + 80 * Math.cos((secondAngle - 90) * Math.PI / 180)}
            y2={100 + 80 * Math.sin((secondAngle - 90) * Math.PI / 180)}
            stroke="#ff4444"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="3" fill="white"/>
        </svg>
        <div className="text-white text-sm font-mono mt-1 font-semibold">
          {timeString}
        </div>
      </div>
    );
  };

  const Weather = memo(({ size = 120 }: { size?: number }) => {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        {weatherData ? (
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {weatherData.weather.temperature + 10}°F
            </div>
            <div className="text-sm font-medium mb-1">
              {weatherData.location.city}, {weatherData.location.country}
            </div>
            <div className="text-xs text-gray-300 leading-tight">
              {(() => {
                const desc = weatherData.weather.description;
                const periodIndex = desc.indexOf('.');
                if (periodIndex !== -1) {
                  return desc.substring(0, periodIndex + 1);
                }
                const words = desc.split(' ');
                return words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');
              })()}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-gray-400 text-xs">-</div>
          </div>
        )}
      </div>
    );
  });

  const Note = memo(({ cardId }: { cardId: number }) => {
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
      const saved = localStorage.getItem(`gridlock-note-${cardId}`);
      if (saved) {
        setNoteText(saved);
      }
    }, [cardId]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setNoteText(newText);
      localStorage.setItem(`gridlock-note-${cardId}`, newText);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLTextAreaElement>) => {
      e.stopPropagation();
    };

    return (
      <div className="h-full flex flex-col">
        <textarea
          value={noteText}
          onChange={handleTextChange}
          onMouseDown={handleMouseDown}
          placeholder="Type your note here..."
          className="w-full h-full bg-transparent text-white text-sm resize-none focus:outline-none placeholder-gray-500 p-2"
          style={{ minHeight: '60px' }}
        />
      </div>
    );
  });

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
    if (draggedCard !== null || e.target !== e.currentTarget || !placementMode || !selectedWidget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const snappedX = Math.floor(x / 160) * 160;
    const snappedY = Math.floor(y / 160) * 160;

    let canPlace = false;
    let width = 1;
    let height = 1;

    if (selectedWidget === 'weather') {
      width = 2;
      height = 1;
      canPlace = true;
      for (let dx = 0; dx < width; dx++) {
        for (let dy = 0; dy < height; dy++) {
          const checkX = snappedX + (dx * 160);
          const checkY = snappedY + (dy * 160);
          const existingCard = cards.find(card =>
            checkX >= card.x && checkX < card.x + (card.width || 1) * 160 &&
            checkY >= card.y && checkY < card.y + (card.height || 1) * 160
          );
          if (existingCard) {
            canPlace = false;
            break;
          }
        }
        if (!canPlace) break;
      }
    } else {
      const existingCard = cards.find(card => card.x === snappedX && card.y === snappedY);
      canPlace = !existingCard;
    }

    if (canPlace) {
      let content = '';
      let url = '';

      if (selectedWidget === 'favorite') {
        content = favoriteName;
        url = favoriteUrl;
        setFavoriteName('');
        setFavoriteUrl('');
      } else {
        const widgetCount = cards.filter(card => card.type === selectedWidget).length + 1;
        content = `${selectedWidget.charAt(0).toUpperCase() + selectedWidget.slice(1)} ${widgetCount}`;
      }

      const newCard = {
        id: cardId,
        x: snappedX,
        y: snappedY,
        content: content,
        type: selectedWidget,
        width: width,
        height: height,
        url: url
      };
      setCards(prev => [...prev, newCard]);
      setCardId(prev => prev + 1);
      setPlacementMode(false);
      setSelectedWidget(null);
      setPlacementPreview(null);
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
    setPlacementPreview(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedCard !== null) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;

      const snappedX = Math.round(x / 160) * 160;
      const snappedY = Math.round(y / 160) * 160;

      setDragPreview({ x: snappedX, y: snappedY });
    } else if (placementMode && selectedWidget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const snappedX = Math.floor(x / 160) * 160;
      const snappedY = Math.floor(y / 160) * 160;

      setPlacementPreview({ x: snappedX, y: snappedY });
    }
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
    setPlacementPreview(null);
  };

  const handleCardContextMenu = (e: React.MouseEvent<HTMLDivElement>, cardId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      cardId
    });
  };

  const deleteCard = (cardId: number) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
    setContextMenu(null);
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleFavoriteSubmit = () => {
    if (favoriteName.trim() && favoriteUrl.trim()) {
      setSelectedWidget('favorite');
      setPlacementMode(true);
      setShowFavoriteModal(false);
    }
  };

  const handleFavoriteCancel = () => {
    setShowFavoriteModal(false);
    setFavoriteName('');
    setFavoriteUrl('');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data =>
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/weather?ip=${encodeURIComponent(data.ip)}`)
          .then(res => res.json())
          .then(data => {
            if (!data.error) setWeatherData(data);
          })
      )
      .catch(() =>
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/weather?ip=127.0.0.1`)
          .then(res => res.json())
          .then(data => {
            if (!data.error) setWeatherData(data);
          })
      );
  }, []);

  useEffect(() => {
    if (selectedResult >= 0 && resultRefs.current[selectedResult]) {
      resultRefs.current[selectedResult]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedResult]);

  useEffect(() => {
    const savedCards = localStorage.getItem('gridlock-cards');
    const savedCardId = localStorage.getItem('gridlock-cardId');
    if (savedCards) {
      setCards(JSON.parse(savedCards));
    }
    if (savedCardId) {
      setCardId(parseInt(savedCardId, 10));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gridlock-cards', JSON.stringify(cards));
    localStorage.setItem('gridlock-cardId', cardId.toString());
  }, [cards, cardId]);

  return (
    <div
      className={`min-h-screen bg-black custom-grid-bg ${showResults ? '' : 'flex items-center justify-center flex-col'}`}
      onClick={(e) => { handleGridClick(e); closeContextMenu(); }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setPlacementPreview(null)}
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
                <div onClick={() => { setSelectedWidget('clock'); setPlacementMode(true); setShowRightPanel(false); }} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
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
                <div onClick={() => { setSelectedWidget('weather'); setPlacementMode(true); setShowRightPanel(false); }} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
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
                <div onClick={() => { setSelectedWidget('note'); setPlacementMode(true); setShowRightPanel(false); }} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <div className="text-center">
                    <h3 className="text-white font-semibold text-lg mb-2">Note</h3>
                    <div className="w-12 h-12 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div onClick={() => { setShowFavoriteModal(true); setShowRightPanel(false); }} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <div className="text-center">
                    <h3 className="text-white font-semibold text-lg mb-2">Favorite</h3>
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

      {placementPreview && placementMode && selectedWidget && (
        <div
          className="absolute bg-blue-500/20 border-2 border-blue-400 border-dashed rounded-lg pointer-events-none"
          style={{
            left: placementPreview.x,
            top: placementPreview.y,
            width: `${(selectedWidget === 'weather' ? 2 : 1) * 160 - 20}px`,
            height: `${(selectedWidget === 'weather' ? 1 : 1) * 160 - 20}px`,
            zIndex: 5
          }}
        >
          <div className="w-full h-full flex items-center justify-center text-blue-300 text-sm font-medium opacity-70">
            {selectedWidget.charAt(0).toUpperCase() + selectedWidget.slice(1)}
          </div>
        </div>
      )}

      {cards.map(card => {
        const isDragging = draggedCard === card.id;
        const position = isDragging && dragPreview ? dragPreview : { x: card.x, y: card.y };
        const cardWidth = (card.width || 1) * 160 - 20;
        const cardHeight = (card.height || 1) * 160 - 20;

        return (
          <div
            key={card.id}
            className={`absolute bg-gray-800/90 backdrop-blur-sm border rounded-lg p-4 cursor-move select-none transition-opacity ${
              isDragging ? 'border-blue-400 shadow-lg opacity-80' : 'border-gray-600'
            }`}
            style={{
              left: position.x,
              top: position.y,
              width: `${cardWidth}px`,
              height: `${cardHeight}px`,
              zIndex: isDragging ? 50 : 10
            }}
            onMouseDown={(e) => handleCardMouseDown(e, card.id)}
            onContextMenu={(e) => handleCardContextMenu(e, card.id)}
          >
            {card.type === 'clock' ? (
              <div className="flex items-center justify-center h-full">
                <Clock size={Math.min(cardWidth - 16, cardHeight - 16)} />
              </div>
            ) : card.type === 'weather' ? (
              <div className="flex items-center justify-center h-full">
                <Weather />
              </div>
            ) : card.type === 'note' ? (
              <div className="h-full p-1">
                <Note cardId={card.id} />
              </div>
            ) : card.type === 'favorite' ? (
              <div
                className="flex flex-col items-center justify-center h-full cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  if (card.url) window.open(card.url, '_blank');
                }}
              >
                <div className="text-white text-sm font-medium text-center mb-2">{card.content}</div>
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-gray-600 transition-colors overflow-hidden">
                  <img
                    src={card.url ? `https://www.google.com/s2/favicons?domain=${new URL(card.url).hostname}&sz=32` : ''}
                    alt=""
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <svg className="w-4 h-4 text-white hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="text-white text-sm font-medium">{card.content}</div>
            )}
          </div>
        );
      })}

      {contextMenu && (
        <div
          className="fixed bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded-lg shadow-xl z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            minWidth: '120px'
          }}
        >
          <button
            onClick={() => deleteCard(contextMenu.cardId)}
            className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700/50 transition-colors flex items-center space-x-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      )}

      {showFavoriteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded-xl shadow-2xl p-6 w-96 max-w-[90vw]">
            <h2 className="text-white text-xl font-semibold mb-6 text-center">Add Favorite</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={favoriteName}
                  onChange={(e) => setFavoriteName(e.target.value)}
                  placeholder="Enter favorite name"
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">URL</label>
                <input
                  type="url"
                  value={favoriteUrl}
                  onChange={(e) => setFavoriteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleFavoriteCancel}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFavoriteSubmit}
                disabled={!favoriteName.trim() || !favoriteUrl.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                Add Favorite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
