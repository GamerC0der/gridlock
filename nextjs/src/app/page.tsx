"use client";

import { Sixtyfour } from "next/font/google";
import { useState } from "react";

const sixtyfour = Sixtyfour({
  subsets: ["latin"],
  weight: "400",
});

export default function Home() {
  const [isVisible, setIsVisible] = useState(true);
  const [inputWidth, setInputWidth] = useState('w-[600px]');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value;
      if (query) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/search?q=BACKEND%20${query}`);
        const data = await response.json();
        setSearchResults(data.results || []);
      }
      setIsVisible(false);
      setInputWidth('w-[1200px]');
      setShowResults(true);
      e.currentTarget?.blur();
    }
  };

  return (
    <div className={`min-h-screen bg-black ${showResults ? '' : 'flex items-center justify-center flex-col'}`}>
      {showResults && (
        <div className="pt-8 pb-4 flex justify-center">
          <div className={`relative ${inputWidth} max-w-2xl`}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Ask or Search"
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder-gray-400"
            />
          </div>
        </div>
      )}

      <div className={`flex items-center justify-center flex-col ${showResults ? 'mt-8' : ''}`}>
        {isVisible && <h1 className={`${sixtyfour.className} text-white text-7xl font-bold mb-8`}>GridLock</h1>}

        {showResults ? (
          <div className="w-full max-w-4xl space-y-4">
            <div className="space-y-4">
              {searchResults.slice(0, 5).map((result, index) => (
                <div key={index} className="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer">
                  <h3 className="text-white font-medium text-lg mb-1">{result.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{result.url}</p>
                  {result.desc && <p className="text-gray-300 text-sm">{result.desc}</p>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`relative ${inputWidth} max-w-2xl`}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Ask or Search"
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder-gray-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}
