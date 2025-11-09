"use client";

import { Sixtyfour } from "next/font/google";
import { useState, useRef, useEffect, memo } from "react";

const sixtyfour = Sixtyfour({
  subsets: ["latin"],
  weight: "400",
});

const quotes = [
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { quote: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { quote: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { quote: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
  { quote: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { quote: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { quote: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { quote: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" }
];

const isCalculation = (query: string): boolean => {
  const trimmed = query.trim().toLowerCase();

  const mathPatterns = [
    /\b(sin|cos|tan|asin|acos|atan|sqrt|log|ln|exp|abs|round|floor|ceil|min|max|pi|e)\b/,
    /[+\-*/^()0-9.\s]+/
  ];

  const hasNumbers = /\d/.test(trimmed);
  const hasOperators = /[+\-*/^()]/.test(trimmed);
  const hasOnlyMath = /^[+\-*/^()0-9.\s=]*(sin|cos|tan|asin|acos|atan|sqrt|log|ln|exp|abs|round|floor|ceil|min|max|pi|e|\s)*[+\-*/^()0-9.\s=]*$/i.test(trimmed);

  const isLikelySearch = /\b(what|how|when|where|why|who|which|can|will|should|would|could|does|do|is|are|was|were|have|has|had)\b/i.test(trimmed);

  return hasNumbers && (hasOperators || mathPatterns.some(pattern => pattern.test(trimmed))) && hasOnlyMath && !isLikelySearch;
};

const evaluateCalculation = (expression: string): string => {
  try {
    let sanitized = expression.replace(/\^/g, '**').replace(/=+$/, '');

    const mathReplacements: { [key: string]: string } = {
      'pi': 'Math.PI',
      'e': 'Math.E',
      'sin': 'Math.sin',
      'cos': 'Math.cos',
      'tan': 'Math.tan',
      'asin': 'Math.asin',
      'acos': 'Math.acos',
      'atan': 'Math.atan',
      'sqrt': 'Math.sqrt',
      'log': 'Math.log10',
      'ln': 'Math.log',
      'exp': 'Math.exp',
      'abs': 'Math.abs',
      'round': 'Math.round',
      'floor': 'Math.floor',
      'ceil': 'Math.ceil',
      'min': 'Math.min',
      'max': 'Math.max'
    };

    Object.keys(mathReplacements).forEach(func => {
      const regex = new RegExp(`\\b${func}\\b`, 'gi');
      sanitized = sanitized.replace(regex, mathReplacements[func]);
    });

    sanitized = sanitized.replace(/\s/g, '');

    if (!/^[0-9+\-*/().Math.PI\s=]+$/.test(sanitized.replace(/Math\./g, '').replace(/PI|E/g, ''))) {
      return 'Invalid calculation';
    }

    const result = new Function('Math', `return ${sanitized}`)(Math);

    if (typeof result === 'number' && isFinite(result)) {
      const rounded = Math.round(result * 1000000000) / 1000000000;
      return rounded.toString();
    } else {
      return 'Invalid result';
    }
  } catch (error) {
    return 'Calculation error';
  }
};

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
  const [cards, setCards] = useState<Array<{id: number, x: number, y: number, content: string, type?: string, width?: number, height?: number, url?: string, quote?: {quote: string, author: string}}>>([]);
  const [cardId, setCardId] = useState(0);
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPreview, setDragPreview] = useState<{ x: number, y: number } | null>(null);
  const [placementPreview, setPlacementPreview] = useState<{ x: number, y: number } | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [placementMode, setPlacementMode] = useState(false);
  const [todos, setTodos] = useState<Array<{id: number, cardId: number, text: string, completed: boolean}>>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState<any>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; cardId: number } | null>(null);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [favoriteName, setFavoriteName] = useState('');
  const [favoriteUrl, setFavoriteUrl] = useState('');
  const [showIframeModal, setShowIframeModal] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [searchResultsCount, setSearchResultsCount] = useState(9);
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('F');
  const [widgetSearchTerm, setWidgetSearchTerm] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [calculationResult, setCalculationResult] = useState<string | null>(null);
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

  const Weather = memo(({ size = 120, temperatureUnit = 'F' }: { size?: number; temperatureUnit?: 'C' | 'F' }) => {
    const convertTemperature = (fahrenheit: number, unit: 'C' | 'F') => {
      if (unit === 'C') {
        return Math.round((fahrenheit - 32) * 5 / 9);
      }
      return Math.round(fahrenheit);
    };

    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        {weatherData ? (
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {convertTemperature(weatherData.weather.temperature + 10, temperatureUnit)}°{temperatureUnit}
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

  const Quote = memo(({ quote }: { quote: {quote: string, author: string} }) => {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white p-2">
        <div className="text-center">
          <div className="text-sm italic mb-2 leading-relaxed">
            "{quote.quote}"
          </div>
          <div className="text-xs text-gray-300 font-medium">
            — {quote.author}
          </div>
        </div>
      </div>
    );
  });

  const IframeWidget = memo(({ cardId, url }: { cardId: number; url?: string }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const loadData = () => {
        const saved = localStorage.getItem(`gridlock-iframe-${cardId}`);
        if (saved) {
          const data = JSON.parse(saved);
          iframe.contentWindow?.postMessage({ type: 'LOAD_DATA', data }, '*');
        }
      };

      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'SAVE_DATA') {
          localStorage.setItem(`gridlock-iframe-${cardId}`, JSON.stringify(event.data.data));
        }
      };

      window.addEventListener('message', handleMessage);
      iframe.onload = loadData;

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }, [cardId]);

    const defaultContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: transparent; color: white; padding: 8px; }
            .content { height: 100%; display: flex; flex-direction: column; }
            input, textarea { background: #374151; color: white; border: none; border-radius: 4px; padding: 4px 8px; outline: none; font-size: 12px; }
            input:focus, textarea:focus { ring: 1px solid #3b82f6; }
            button { background: #2563eb; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px; }
            button:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="content">
            <div style="margin-bottom: 8px;">
              <input id="input-field" type="text" placeholder="Enter content..." style="width: 100%; margin-bottom: 4px;">
              <button id="add-btn">Add</button>
            </div>
            <div id="content-list" style="flex: 1; overflow-y: auto;"></div>
          </div>
          <script>
            let items = [];

            function render() {
              const list = document.getElementById('content-list');
              list.innerHTML = items.map((item, index) => \`<div style="margin-bottom: 4px; padding: 4px; background: #374151; border-radius: 4px;">\${item} <span onclick="removeItem(\${index})" style="float: right; cursor: pointer; color: #ef4444;">×</span></div>\`).join('');
              saveData();
            }

            function addItem() {
              const input = document.getElementById('input-field');
              const text = input.value.trim();
              if (text) {
                items.push(text);
                input.value = '';
                render();
              }
            }

            function removeItem(index) {
              items.splice(index, 1);
              render();
            }

            function saveData() {
              window.parent.postMessage({ type: 'SAVE_DATA', data: items }, '*');
            }

            document.getElementById('add-btn').onclick = addItem;
            document.getElementById('input-field').onkeypress = (e) => {
              if (e.key === 'Enter') addItem();
            };

            window.addEventListener('message', (event) => {
              if (event.data.type === 'LOAD_DATA') {
                items = event.data.data;
                render();
              }
            });
          </script>
        </body>
      </html>
    `;

    return (
      <iframe
        ref={iframeRef}
        srcDoc={url ? undefined : defaultContent}
        src={url}
        className="w-full h-full border-none bg-transparent"
        title="Iframe Widget"
      />
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
    const trimmedQuery = query.trim();

    if (isCalculation(trimmedQuery)) {
      const result = evaluateCalculation(trimmedQuery);
      setCalculationResult(result);
      setSearchResults([]);
      setAiSummary('');
      setError(null);
      setIsLoading(false);
      return;
    }

    if (trimmedQuery && !searchHistory.includes(trimmedQuery)) {
      const newHistory = [trimmedQuery, ...searchHistory.slice(0, 9)];
      setSearchHistory(newHistory);
      localStorage.setItem('gridlock-search-history', JSON.stringify(newHistory));
    }

    const widgetKeywords = {
      'clock': { name: 'Clock Widget', desc: 'Add a clock widget to your dashboard', icon: '🕐' },
      'weather': { name: 'Weather Widget', desc: 'Add a weather widget to your dashboard', icon: '🌤️' },
      'quote': { name: 'Quote Widget', desc: 'Add a random inspirational quote widget', icon: '💭' },
      'note': { name: 'Note Widget', desc: 'Add a note widget to your dashboard', icon: '📝' },
      'iframe': { name: 'Iframe Widget', desc: 'Add an iframe widget to embed websites', icon: '🌐' },
      'favorite': { name: 'Favorite Widget', desc: 'Add a favorite link widget to your dashboard', icon: '⭐' }
    };

    const lowerQuery = trimmedQuery.toLowerCase();
    const matchingWidget = Object.keys(widgetKeywords).find(keyword =>
      keyword === lowerQuery || lowerQuery.includes(keyword)
    );

    setIsLoading(true);
    setError(null);
    setAiSummary('');
    setCalculationResult(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/search?q=BACKEND%20${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      let results = data.results || [];

      if (matchingWidget) {
        const widget = widgetKeywords[matchingWidget as keyof typeof widgetKeywords];
        const widgetResult = {
          title: `${widget.icon} ${widget.name}`,
          url: '#',
          desc: widget.desc,
          type: 'widget',
          widgetType: matchingWidget
        };
        results = [widgetResult, ...results];
      }

      setSearchResults(results);
      getAiSummary(query, results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAiSummary = async (query: string, results: any[]) => {
    try {
      const messages = [
        {
          role: "user",
          content: `Please provide a brief summary of the following search results for the query "${query}". Here are the top results:\n\n${results.slice(0, 5).map((r, i) => `${i + 1}. ${r.title}: ${r.desc || 'No description'}`).join('\n')}`
        }
      ];

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          stream: true
        })
      });

      if (!response.ok) throw new Error('AI summary failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulatedSummary = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: data: ')) {
              const dataStr = line.slice(11);
              if (dataStr === '[DONE]') break;
              try {
                const data = JSON.parse(dataStr);
                if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                  accumulatedSummary += data.choices[0].delta.content;
                  setAiSummary(accumulatedSummary);
                }
              } catch (e) {
              }
            }
          }
        }
      }
    } catch (err) {
      setAiSummary('AI summary unavailable');
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
    } else if (showResults && searchResults.length > 0 && !calculationResult) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedResult(prev => Math.min(prev + 1, searchResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedResult(prev => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && selectedResult >= 0) {
        e.preventDefault();
        const result = searchResults[selectedResult];
        if (result.type === 'widget') {
          setSelectedWidget(result.widgetType);
          setPlacementMode(true);
          setShowRightPanel(false);
          clearSearch();
        } else if (result.url && result.url !== '#') {
          window.open(result.url, '_blank');
        }
      }
    }
  };

  const clearSearch = () => {
    setShowResults(false);
    setIsVisible(true);
    setInputWidth('w-[600px]');
    setSearchResults([]);
    setAiSummary('');
    setCalculationResult(null);

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
    } else if (selectedWidget === 'quote') {
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
    } else if (selectedWidget === 'iframe') {
      width = 2;
      height = 2;
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
      let quote = undefined;

      if (selectedWidget === 'quote') {
        quote = quotes[Math.floor(Math.random() * quotes.length)];
        content = `Quote ${cards.filter(card => card.type === selectedWidget).length + 1}`;
      } else if (selectedWidget === 'favorite') {
        content = favoriteName;
        url = favoriteUrl;
        setFavoriteName('');
        setFavoriteUrl('');
      } else if (selectedWidget === 'iframe') {
        url = iframeUrl;
        setIframeUrl('');
        const widgetCount = cards.filter(card => card.type === selectedWidget).length + 1;
        content = `Iframe ${widgetCount}`;
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
        url: url,
        quote: quote
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

  const handleIframeSubmit = () => {
    if (iframeUrl.trim()) {
      setSelectedWidget('iframe');
      setPlacementMode(true);
      setShowIframeModal(false);
    }
  };

  const handleIframeCancel = () => {
    setShowIframeModal(false);
    setIframeUrl('');
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

  useEffect(() => {
    const savedHistory = localStorage.getItem('gridlock-search-history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    const savedAccentColor = localStorage.getItem('gridlock-accent-color');
    if (savedAccentColor) {
      setAccentColor(savedAccentColor);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gridlock-accent-color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    const savedTemperatureUnit = localStorage.getItem('gridlock-temperature-unit');
    if (savedTemperatureUnit && (savedTemperatureUnit === 'C' || savedTemperatureUnit === 'F')) {
      setTemperatureUnit(savedTemperatureUnit);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gridlock-temperature-unit', temperatureUnit);
  }, [temperatureUnit]);



  return (
    <div
      className={`min-h-screen bg-background custom-grid-bg ${showResults ? '' : 'flex items-center justify-center flex-col'}`}
      onClick={(e) => { handleGridClick(e); closeContextMenu(); }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setPlacementPreview(null)}
    >
      <div className="fixed left-8 top-1/2 transform -translate-y-1/2 flex flex-col space-y-3 z-10">
        <button
          onClick={() => setShowRightPanel(!showRightPanel)}
          className="w-12 h-12 bg-gray-700 dark:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-600 dark:hover:bg-gray-600"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="w-12 h-12 bg-gray-700 dark:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-600 dark:hover:bg-gray-600"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button
          onClick={() => {
            setCards([]);
            setCardId(0);
          }}
          className="w-12 h-12 bg-gray-700 dark:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-600 dark:hover:bg-gray-600"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
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
        {isVisible && <h1 className={`${sixtyfour.className} text-foreground text-7xl font-bold mb-8`}>GridLock</h1>}

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

            {!isLoading && !error && searchResults.length === 0 && currentQuery && !calculationResult && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">No results found for "{currentQuery}"</p>
              </div>
            )}

            {!isLoading && !error && calculationResult && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-6 max-w-4xl">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-white font-semibold text-lg">Calculator</h3>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="text-gray-300 text-sm mb-2">Expression: {currentQuery}</div>
                  <div className="text-white text-2xl font-mono font-bold">= {calculationResult}</div>
                </div>
              </div>
            )}

            {!isLoading && !error && searchResults.length > 0 && (
              <>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-6 max-w-4xl">
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="text-white font-semibold text-lg">AI Summary</h3>
                  </div>
                  <div className="text-gray-300 leading-relaxed">
                    {aiSummary ? (
                      <p>{aiSummary}</p>
                    ) : (
                      <p className="text-gray-500"></p>
                    )}
                  </div>
                </div>

                <div className={`grid gap-4 ${searchResultsCount === 9 ? 'grid-cols-3 max-w-4xl' : 'grid-cols-2 max-w-2xl'}`}>
                  {searchResults.slice(0, searchResultsCount).map((result, index) => (
                  <div
                    key={index}
                    ref={el => { resultRefs.current[index] = el; }}
                    onClick={() => {
                      if (result.type === 'widget') {
                        setSelectedWidget(result.widgetType);
                        setPlacementMode(true);
                        setShowRightPanel(false);
                        clearSearch();
                      } else if (result.url && result.url !== '#') {
                        window.open(result.url, '_blank');
                      }
                    }}
                    className={`group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl transition-all duration-200 cursor-pointer flex flex-col ${
                      searchResultsCount === 9 ? 'p-6 aspect-[3/2]' : 'p-4 aspect-[2/1]'
                    } ${
                      selectedResult === index ? 'ring-2 ring-blue-500 bg-gray-700/70' : ''
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <h3 className="text-white font-semibold text-sm mb-2 transition-colors line-clamp-2 flex-shrink-0">
                        {result.title}
                      </h3>
                      <div className="flex items-center text-gray-400 text-xs mb-2 flex-shrink-0">
                        {result.type === 'widget' ? (
                          <>
                            <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                            <span className="truncate transition-colors">
                              Widget
                            </span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="truncate transition-colors">
                              {result.url}
                            </span>
                          </>
                        )}
                      </div>
                      {result.desc && (
                        <p className="text-gray-300 text-xs leading-relaxed line-clamp-3 flex-1">
                          {result.desc}
                        </p>
                      )}
                      <div className="flex justify-end mt-2 flex-shrink-0">
                        {result.type === 'widget' ? (
                          <svg className="w-4 h-4 text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        )}
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

            {!isLoading && !error && calculationResult && (
              <div className="text-center mt-6 mb-6">
                <p className="text-gray-400 text-sm">
                  Calculation result for <span className="text-blue-400 font-medium">"{currentQuery}"</span>
                </p>
              </div>
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
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 150)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder-gray-500 dark:placeholder-gray-400"
            />

            {showHistory && searchHistory.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Recent Searches</span>
                    <button
                      onClick={() => {
                        setSearchHistory([]);
                        localStorage.removeItem('gridlock-search-history');
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      Clear
                    </button>
                  </div>
                  {searchHistory.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (inputRef.current) {
                          inputRef.current.value = query;
                        }
                        performSearch(query);
                        setShowHistory(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {query}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showRightPanel && (
        <div className="fixed left-24 top-1/2 transform -translate-y-1/2 w-80 bg-gray-900/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-20">
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
                value={widgetSearchTerm}
                onChange={(e) => setWidgetSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 dark:bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder-gray-400 dark:placeholder-gray-400"
              />
            </div>

            <div className="space-y-4">
              {(() => {
                const allWidgets = [
                  {
                    id: 'clock',
                    name: 'Clock',
                    icon: (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,6 12,12 16,14"></polyline>
                      </svg>
                    ),
                    onClick: () => { setSelectedWidget('clock'); setPlacementMode(true); setShowRightPanel(false); setWidgetSearchTerm(''); }
                  },
                  {
                    id: 'weather',
                    name: 'Weather',
                    icon: (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.9 5.002 5.002 0 00-9.8 1.1A4 4 0 003 15z" />
                      </svg>
                    ),
                    onClick: () => { setSelectedWidget('weather'); setPlacementMode(true); setShowRightPanel(false); setWidgetSearchTerm(''); }
                  },
                  {
                    id: 'quote',
                    name: 'Quote',
                    icon: (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    ),
                    onClick: () => { setSelectedWidget('quote'); setPlacementMode(true); setShowRightPanel(false); setWidgetSearchTerm(''); }
                  },
                  {
                    id: 'iframe',
                    name: 'Iframe',
                    icon: (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ),
                    onClick: () => { setShowIframeModal(true); setShowRightPanel(false); setWidgetSearchTerm(''); }
                  },
                  {
                    id: 'note',
                    name: 'Note',
                    icon: (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    ),
                    onClick: () => { setSelectedWidget('note'); setPlacementMode(true); setShowRightPanel(false); setWidgetSearchTerm(''); }
                  },
                  {
                    id: 'favorite',
                    name: 'Favorite',
                    icon: (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                      </svg>
                    ),
                    onClick: () => { setShowFavoriteModal(true); setShowRightPanel(false); setWidgetSearchTerm(''); }
                  }
                ];

                const filteredWidgets = allWidgets.filter(widget =>
                  widget.name.toLowerCase().includes(widgetSearchTerm.toLowerCase())
                );

                if (filteredWidgets.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">No widgets found for "{widgetSearchTerm}"</p>
                    </div>
                  );
                }

                const widgetGrid = [];
                for (let i = 0; i < filteredWidgets.length; i += 2) {
                  widgetGrid.push(
                    <div key={i} className="grid grid-cols-2 gap-4">
                      {filteredWidgets.slice(i, i + 2).map((widget) => (
                        <div
                          key={widget.id}
                          onClick={widget.onClick}
                          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                          <div className="text-center">
                            <h3 className="text-white font-semibold text-lg mb-2">{widget.name}</h3>
                            <div className="w-12 h-12 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                              {widget.icon}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                return widgetGrid;
              })()}
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
            width: `${((selectedWidget === 'weather' || selectedWidget === 'quote') ? 2 : selectedWidget === 'iframe' ? 2 : 1) * 160 - 20}px`,
            height: `${(selectedWidget === 'weather' ? 1 : selectedWidget === 'quote' ? 1 : selectedWidget === 'iframe' ? 2 : 1) * 160 - 20}px`,
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
                <Clock key={card.id} size={Math.min(cardWidth - 16, cardHeight - 16)} />
              </div>
            ) : card.type === 'weather' ? (
              <div className="flex items-center justify-center h-full">
                <Weather key={card.id} temperatureUnit={temperatureUnit} />
              </div>
            ) : card.type === 'note' ? (
              <div className="h-full p-1">
                <Note key={card.id} cardId={card.id} />
              </div>
            ) : card.type === 'quote' ? (
              <div className="flex items-center justify-center h-full">
                <Quote key={card.id} quote={card.quote!} />
              </div>
            ) : card.type === 'iframe' ? (
              <div className="h-full">
                <IframeWidget key={card.id} cardId={card.id} url={card.url} />
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
          className="fixed bg-gray-800/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded-lg shadow-xl z-50"
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
        <div className="fixed inset-0 bg-black/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded-xl shadow-2xl p-6 w-96 max-w-[90vw] relative">
            <button
              onClick={handleFavoriteCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-white text-xl font-semibold mb-6 text-center">Add Favorite</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={favoriteName}
                  onChange={(e) => setFavoriteName(e.target.value)}
                  placeholder="Enter favorite name"
                  className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {showIframeModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded-xl shadow-2xl p-6 w-96 max-w-[90vw] relative">
            <button
              onClick={handleIframeCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-white text-xl font-semibold mb-6 text-center">Add Iframe</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">URL</label>
                <input
                  type="url"
                  value={iframeUrl}
                  onChange={(e) => setIframeUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleIframeCancel}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleIframeSubmit}
                disabled={!iframeUrl.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                Add Iframe
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded-xl shadow-2xl p-6 w-96 max-w-[90vw] relative">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-white text-xl font-semibold mb-6 text-center">Settings</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-3">Search Results</label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSearchResultsCount(4)}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      searchResultsCount === 4
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    4
                  </button>
                  <button
                    onClick={() => setSearchResultsCount(9)}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      searchResultsCount === 9
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    9
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-3">Temperature Unit</label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setTemperatureUnit('F')}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      temperatureUnit === 'F'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    °F
                  </button>
                  <button
                    onClick={() => setTemperatureUnit('C')}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      temperatureUnit === 'C'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    °C
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-3">Actions</label>
                <button
                  onClick={() => {
                    setCards([]);
                    setCardId(0);
                    setShowSettingsModal(false);
                  }}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear All Cards
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
