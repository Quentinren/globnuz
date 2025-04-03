// src/components/TopMenu.jsx
import React, { useState } from 'react';
import { Search, Settings, Crown, X } from 'lucide-react';
import Logo from './Logo'
import './TopMenu.css';

const TopMenu = () => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchToggle = () => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      setSearchQuery('');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
    // Implement search functionality here
  };

  return (
    <div className="top-menu">
      <div className="top-menu-content">
        {/* Logo is already in the app, we'll keep it positioned as is */}
      <Logo />
        {/* Search Bar */}
        <div className={`search-container ${isSearchActive ? 'active' : ''}`}>
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search for news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {isSearchActive && (
              <button 
                type="button" 
                className="search-clear" 
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchActive(false);
                }}
              >
                <X size={18} />
              </button>
            )}
          </form>
          <button 
            className="search-toggle" 
            onClick={handleSearchToggle}
            aria-label="Toggle search"
          >
            <Search size={20} />
          </button>
        </div>
        
        {/* Right side buttons */}
        <div className="top-menu-buttons">
          <button className="config-button" aria-label="Configuration">
            <Settings size={20} />
          </button>
          <button className="premium-button" aria-label="Premium">
            <Crown size={20} />
            <span>Premium</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopMenu;