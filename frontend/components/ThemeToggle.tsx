'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <button
      onClick={handleToggle}
      className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300 overflow-hidden group border-none outline-none focus:outline-none"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Koyu Tema' : 'Açık Tema'}
    >
      {/* Background Animation */}
      <div className={`absolute inset-0 bg-gradient-to-tr from-amber-200 to-yellow-100 dark:from-indigo-900 dark:to-purple-900 transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} />
      
      {/* Sun Icon */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
        theme === 'dark' 
          ? 'opacity-0 rotate-180 scale-0' 
          : 'opacity-100 rotate-0 scale-100'
      }`}>
        <svg 
          className="w-5 h-5 text-amber-600 group-hover:text-amber-700 transition-colors" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>

      {/* Moon Icon */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
        theme === 'dark' 
          ? 'opacity-100 rotate-0 scale-100' 
          : 'opacity-0 -rotate-180 scale-0'
      }`}>
        <svg 
          className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" 
          />
        </svg>
      </div>

      {/* Sparkle Animation */}
      {isAnimating && (
        <>
          <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full animate-ping" />
          <div className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '100ms' }} />
          <div className="absolute top-1/2 left-1 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '200ms' }} />
        </>
      )}
    </button>
  );
}
