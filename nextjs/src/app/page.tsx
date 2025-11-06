"use client";

import { Sixtyfour } from "next/font/google";
import { useState } from "react";

const sixtyfour = Sixtyfour({
  subsets: ["latin"],
  weight: "400",
});

const searchResults = [
  "Example",
  "Example",
  "Example",
  "Example",
  "Example",
  "Example",
  "Example",
  "Example"
];

export default function Home() {
  const [isVisible, setIsVisible] = useState(true);
  const [inputWidth, setInputWidth] = useState('w-[600px]');
  const [showResults, setShowResults] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsVisible(false);
      setInputWidth('w-[300px]');
      setShowResults(true);
      e.currentTarget.blur();
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center flex-col">
      {isVisible && <h1 className={`${sixtyfour.className} text-white text-7xl font-bold mb-8`}>GridLock</h1>}
      {showResults ? (
        <div className="grid grid-cols-3 grid-rows-3 gap-8 max-w-4xl items-center">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer">
            <h3 className="text-white text-center font-medium">{searchResults[0]}</h3>
          </div>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer">
            <h3 className="text-white text-center font-medium">{searchResults[1]}</h3>
          </div>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer">
            <h3 className="text-white text-center font-medium">{searchResults[2]}</h3>
          </div>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer">
            <h3 className="text-white text-center font-medium">{searchResults[3]}</h3>
          </div>
          <div className={`relative ${inputWidth} max-w-2xl flex items-center justify-center p-6`}>
            <input
              type="search"
              placeholder="Ask or Search"
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder-gray-400"
            />
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none pl-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer">
            <h3 className="text-white text-center font-medium">{searchResults[4]}</h3>
          </div>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer">
            <h3 className="text-white text-center font-medium">{searchResults[5]}</h3>
          </div>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer">
            <h3 className="text-white text-center font-medium">{searchResults[6]}</h3>
          </div>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer">
            <h3 className="text-white text-center font-medium">{searchResults[7]}</h3>
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
  );
}
