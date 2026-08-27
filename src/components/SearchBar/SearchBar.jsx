import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const SearchBar = ({ value, onChange, searchHistory, onSelectHistory, isLoading, posts, onSelectPost }) => {
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matches = useMemo(() => {
    if (!value || !posts || posts.length === 0) return [];
    const q = value.toLowerCase().trim();
    if (!q) return [];
    return posts
      .filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.summary && p.summary.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.author && p.author.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [value, posts]);

  const showHistory = isFocused && !value && searchHistory && searchHistory.length > 0;
  const showMatches = isFocused && value && matches.length > 0;
  const showDropdown = showHistory || showMatches;

  return (
    <div className="w-full max-w-full relative px-2 sm:px-0 box-border" ref={dropdownRef}>
      <style>{`
        @keyframes spinPulse {
          0% { transform: translateY(-50%) rotate(0deg); }
          100% { transform: translateY(-50%) rotate(360deg); }
        }
        .search-loading-spinner {
          animation: spinPulse 0.8s linear infinite;
        }
      `}</style>

      <label htmlFor="news-search" className="sr-only">
        Shakisha inkuru
      </label>
      <div className="relative w-full">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>

        <input
          id="news-search"
          type="text"
          placeholder="Shakisha inkuru..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full rounded-full border border-gray-300 bg-white py-3 pl-11 pr-14 text-sm text-black sm:text-base shadow-sm outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isLoading && (
            <div className="search-loading-spinner h-4 w-4 rounded-full border-2 border-red-600 border-t-transparent" title="Birashakishwa..." />
          )}

          {value && !isLoading && (
            <button
              onClick={() => onChange('')}
              className="text-gray-400 hover:text-gray-600 focus:outline-none p-1"
              title="Siba ibyo washakishije"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {showHistory && (
            <div className="p-3">
              <p className="mb-2 break-words text-xs font-semibold uppercase tracking-wider text-gray-400">Ibyashakishijwe vuba</p>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onSelectHistory(item);
                      setIsFocused(false);
                    }}
                    className="text-xs bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 px-3 py-1.5 rounded-full transition truncate max-w-full"
                  >
                    ⏱️ {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showMatches && (
            <div className="p-1">
              <p className="break-words px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Inkuru zihuye n'ibyo washakishije</p>
              {matches.map((post) => (
                <button
                  key={post.id}
                  onClick={() => {
                    if (onSelectPost) onSelectPost(post.id);
                    setIsFocused(false);
                    onChange('');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 transition flex items-center gap-3 rounded-lg"
                >
                  {post.image && (
                    <img
                      src={post.image}
                      alt=""
                      className="h-10 w-10 rounded-md object-cover shrink-0 bg-gray-100"
                      loading="lazy"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{post.category}</p>
                  </div>
                </button>
              ))}
              <div className="px-3 py-2 border-t border-gray-100">
                <Link
                  to={`/?q=${encodeURIComponent(value)}`}
                  onClick={() => setIsFocused(false)}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 transition"
                >
                  Reba ibisubizo byose →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
