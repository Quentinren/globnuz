// NewsScroll.jsx - Fixed for proper infinite scrolling and outside click handling
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Globe, ChevronLeft, Newspaper, User, Tag, Filter, AlertCircle } from 'lucide-react';
import './NewsScroll.css';

const NewsScroll = ({ newsEvents, onNavigateToArticle, activeTitle, hasMoreData, isLoadingMore, onLoadMore , language}) => {
  const [isOpen, setIsOpen] = useState(true);
  const observerRef = useRef(null);
  const loaderRef = useRef(null);
  
  // Helper function to get theme colors
  const getThemeColor = (theme) => {
    if (!theme) return "var(--default-color)"; // Fallback CSS variable
    
    const cssVariable = `--${theme}-color`;
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue(cssVariable);
  
    return themeColor.trim() || "var(--default-color)"; // Return CSS variable or fallback
  };

  
  // Function to format relative time based on language
  const getRelativeTime = (dateString, lang = language) => {
    if (!dateString) return '';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInMilliseconds = now - date;
    
    // Convert to units
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);
    
    // Translations for relative time phrases
    const translations = {
      'FR': {
        'just_now': 'À l\'instant',
        'minutes_ago': (n) => `Il y a ${n} minute${n > 1 ? 's' : ''}`,
        'hours_ago': (n) => `Il y a ${n} heure${n > 1 ? 's' : ''}`,
        'days_ago': (n) => `Il y a ${n} jour${n > 1 ? 's' : ''}`,
        'months_ago': (n) => `Il y a ${n} mois`,
        'years_ago': (n) => `Il y a ${n} an${n > 1 ? 's' : ''}`
      },
      'EN': {
        'just_now': 'Just now',
        'minutes_ago': (n) => `${n} minute${n > 1 ? 's' : ''} ago`,
        'hours_ago': (n) => `${n} hour${n > 1 ? 's' : ''} ago`,
        'days_ago': (n) => `${n} day${n > 1 ? 's' : ''} ago`,
        'months_ago': (n) => `${n} month${n > 1 ? 's' : ''} ago`,
        'years_ago': (n) => `${n} year${n > 1 ? 's' : ''} ago`
      },
      'ES': {
        'just_now': 'Ahora mismo',
        'minutes_ago': (n) => `Hace ${n} minuto${n > 1 ? 's' : ''}`,
        'hours_ago': (n) => `Hace ${n} hora${n > 1 ? 's' : ''}`,
        'days_ago': (n) => `Hace ${n} día${n > 1 ? 's' : ''}`,
        'months_ago': (n) => `Hace ${n} mes${n > 1 ? 'es' : ''}`,
        'years_ago': (n) => `Hace ${n} año${n > 1 ? 's' : ''}`
      }
    };
    
    // Default to French if language not supported
    const trans = translations[lang] || translations['FR'];
    
    // Format the relative time
    if (diffInSeconds < 60) {
      return trans['just_now'];
    } else if (diffInMinutes < 60) {
      return trans['minutes_ago'](diffInMinutes);
    } else if (diffInHours < 24) {
      return trans['hours_ago'](diffInHours);
    } else if (diffInDays < 30) {
      return trans['days_ago'](diffInDays);
    } else if (diffInMonths < 12) {
      return trans['months_ago'](diffInMonths);
    } else {
      return trans['years_ago'](diffInYears);
    }
  };
  
  // Handle infinite scroll with Intersection Observer
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 0.1
    };
    
    const handleObserver = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !isLoadingMore && hasMoreData) {
        // Call the parent's onLoadMore function instead of internal function
        if (onLoadMore) {
          onLoadMore();
        }
      }
    };
    
    observerRef.current = new IntersectionObserver(handleObserver, options);
    
    if (loaderRef.current) {
      observerRef.current.observe(loaderRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoadingMore, hasMoreData, onLoadMore]);
  
  const handleNavigateToArticle = (lat, lng) => {
    // Log the coordinates for debugging
    console.log('Navigation coordinates:', { lat, lng });
    
    // Check if coordinates are valid
    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates for navigation:', { lat, lng });
      return; // Don't proceed with invalid coordinates
    }
    
    // Call the parent component's navigation function
    if (onNavigateToArticle) {
      onNavigateToArticle(lat, lng);
    }
  };
  
  // Toggle the feed open/closed
  const toggleFeed = () => {
    setIsOpen(!isOpen);
  };

  // Helper to get the gradient class based on the theme
  const getGradientClass = (theme) => {
    if (!theme) return 'gradient-default';
    return `gradient-${theme.toLowerCase()}`;
  };

  // Helper to get the feed item class based on the theme
  const getFeedItemClass = (theme) => {
    if (!theme) return 'border-default';
    return `border-${theme.toLowerCase()}`;
  };

  // Highlight the active title if provided
  useEffect(() => {
    if (activeTitle) {
      // Find the element with the active title and scroll to it
      const activeElement = document.querySelector(`[data-title="${activeTitle}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a highlight class
        activeElement.classList.add('highlighted');
        // Remove highlight after a delay
        setTimeout(() => {
          activeElement.classList.remove('highlighted');
        }, 2000);
      }
    }
  }, [activeTitle]);

  return (
    <div className={`custom-news-container ${isOpen ? 'open' : 'closed'}`}>
      <button className="news-toggle-button" onClick={toggleFeed}>
        {isOpen ? <ChevronLeft size={20} /> : <ChevronLeft size={20} className="flipped" />}
        {!isOpen && <span>Latest News</span>}
      </button>
      
      <div className="news-feed-wrapper">
        <div className="news-feed-content">
          {/* No results message */}
          {newsEvents.length === 0 && !isLoadingMore && (
            <div className="no-results-message">
              <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.6 }} />
              <h3>No matching news</h3>
              <p>Try adjusting your filters or check back later for more news.</p>
              <div className="filter-tip">
                <Filter size={16} style={{ marginRight: '8px' }} />
                <span>Use the filter button at the bottom right to change your search criteria.</span>
              </div>
            </div>
          )}

          {/* Render ALL news events from the prop instead of sliced visibleEvents */}
          {newsEvents.map((event, index) => (
            <div 
              key={index} 
              className={`news-feed-item ${getFeedItemClass(event.theme)}`}
              data-title={event.title}
              onClick={() => handleNavigateToArticle(event.latitude, event.longitude)}
            >
              {event.image ? (
                <div className="news-feed-item-image-container">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="news-feed-item-image"
                  />
                </div>
              ) : (
                <div className="news-feed-item-image-container">
                  <div className={`gradient-fallback ${getGradientClass(event.theme)}`}>
                    <div>{event.theme ? event.theme.toUpperCase() : 'NEWS'}</div>
                  </div>
                </div>
              )}
              
              <div className="news-feed-item-content-wrapper">
                <h3 className="news-feed-item-title">
                  {event.country_id && (
                    <img
                      src={`https://flagcdn.com/${event.country_id.toLowerCase()}.svg`}
                      alt={`Flag of ${event.country_id}`}
                      style={{ width: "22px", height: "16px", marginRight:"6px" }}
                    />
                  )}
                  {event.title}
                </h3>
                <h4 className="news-feed-item-subtitle">{event.subtitle}</h4>
                {/* Theme and subtheme chips 
                <div className="news-feed-item-chips">
                  {event.theme && (
                    <span 
                      className="theme-chip" 
                      style={{ backgroundColor: getThemeColor(event.theme) }}
                    >
                      <Tag size={10} className="chip-icon" />
                      {event.theme}
                    </span>
                  )}
                  {event.theme_tags && event.theme_tags.map((theme_tag, i) => (
                    <span key={i} className="subtheme-chip">
                      {theme_tag}
                    </span>
                  ))}
                </div>*/}
                
                <p className="news-feed-item-description">{event.description}</p>
                
                {/* Footer with buttons and info */}
                <div className="news-feed-item-footer">
                  <div className="news-feed-item-info">
                    <div className="news-feed-item-info-row">
                      <div className="news-feed-item-newspaper" onClick={() => window.open(event.external_link, "_blank")}>
                      <Newspaper size={10} className="news-feed-item-info-icon" /> 
                        {event.newspaper ? event.newspaper.name : event.newspaper_id}
                      </div>
                    </div>
                    <div className="news-feed-item-info-row">
                      <Calendar size={10} className="news-feed-item-info-icon" /> 
                               <span className="metadata-text">
                        {getRelativeTime(event.publication_date, language)}
                      </span>
                    </div>

                    <div className="news-feed-item-info-row">
                      <MapPin size={10} className="news-feed-item-info-icon" /> 
                      <span> {event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading indicator and observer target */}
          {hasMoreData && (
            <div className="loader-container" ref={loaderRef}>
              {isLoadingMore ? (
                <div className="news-feed-loader">
                  <div className="news-feed-loader-dot"></div>
                  <div className="news-feed-loader-dot"></div>
                  <div className="news-feed-loader-dot"></div>
                </div>
              ) : (
                <button className="load-more-button" onClick={onLoadMore}>
                  Load More
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsScroll;