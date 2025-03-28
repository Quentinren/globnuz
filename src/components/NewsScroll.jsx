// NewsScroll.jsx
import React, { useState, useEffect, useRef } from 'react';
import Grid from '@mui/material/Grid';
import Stack from "@mui/material/Stack";
import { Calendar, MapPin, Globe, ChevronLeft, Newspaper, User, Tag } from 'lucide-react';
import './NewsScroll.css';

const NewsScroll = ({ newsEvents, onNavigateToArticle }) => {
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(true);
  const observerRef = useRef(null);
  const loaderRef = useRef(null);
  
  const ITEMS_PER_PAGE = 100;
  
  // Helper function to get theme colors
  const getThemeColor = (theme) => {
    if (!theme) return '#34495e';
    
    const themeColors = {
      environment: '#2ecc71', // Green
      politics: '#3498db', // Blue
      health: '#e74c3c', // Red
      science: '#9b59b6', // Purple
      technology: '#f39c12', // Orange
      economy: '#1abc9c', // Teal
      culture: '#d35400', // Dark Orange
      sport: '#27ae60', // Dark Green
      war: '#c0392b', // Dark Red
      disaster: '#e67e22', // Light Orange
      default: '#34495e' // Dark Blue
    };
    
    return themeColors[theme.toLowerCase()] || themeColors.default;
  };
  
  // Initialize with first page of events
  useEffect(() => {
    if (newsEvents.length > 0) {
      setVisibleEvents(newsEvents.slice(0, ITEMS_PER_PAGE));
    }
  }, [newsEvents]);
  
  // Handle infinite scroll with Intersection Observer
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 0.1
    };
    
    const handleObserver = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading) {
        loadMoreEvents();
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
  }, [loading, visibleEvents]);
  
  // Load more events function
  const loadMoreEvents = () => {
    setLoading(true);
    
    // Simulate API fetch delay
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      
      // Don't exceed array length
      if (startIndex < newsEvents.length) {
        const newEvents = newsEvents.slice(0, endIndex);
        setVisibleEvents(newEvents);
        setPage(nextPage);
      }
      
      setLoading(false);
    }, 500);
  };
  
  // Handle navigation to the event on the globe
  const handleNavigateToArticle = (lat, lng) => {
    if (onNavigateToArticle) {
      onNavigateToArticle(lat, lng);
    }
  };
  
  // Toggle the feed open/closed
  const toggleFeed = () => {
    setIsOpen(!isOpen);
  };


  return (
    <div className={`custom-news-container ${isOpen ? 'open' : 'closed'}`}>
      <button className="news-toggle-button" onClick={toggleFeed}>
        {isOpen ? <ChevronLeft size={20} /> : <ChevronLeft size={20} className="flipped" />}
        {!isOpen && <span>Latest News</span>}
      </button>
      
      <div className="news-feed-wrapper">
        <div className="news-feed-content">
          {visibleEvents.map((event, index) => (
            <div key={index} className={`news-feed-item theme-${index % 5}`}>
              <div className="news-feed-item-image-container">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="news-feed-item-image"
                />
              </div>
              
              <div className="news-feed-item-content-wrapper">
                <h3 className="news-feed-item-title">{event.title}</h3>
                <h4 className="news-feed-item-subtitle">{event.subtitle}</h4>
                {/* Theme and subtheme chips */}
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
                  {event.themeTags && event.themeTags.map((subtheme, i) => (
                    <span key={i} className="subtheme-chip">
                     
                      {subtheme}
                    </span>
                  ))}
                </div>
                
                <p className="news-feed-item-description">{event.description}</p>
                
                {/* Footer with buttons and info */}
                <div className="news-feed-item-footer">
                  <div className="news-feed-item-buttons">
                    <button 
                      className="news-feed-item-button"
                      onClick={() => handleNavigateToArticle(event.lat, event.lng)}
                      aria-label="Show on globe"
                    >
                      <Globe size={14} />
                    </button>
                    <button 
                      className="news-feed-item-button"
                      onClick={() => window.open(event.externalLink, "_blank")}
                      aria-label="Open article"
                    >
                      <Newspaper size={14} />
                    </button>
                  </div>
                  
                  <div className="news-feed-item-info">
                    <Grid container>
                    <div className="news-feed-item-info-row">
                      <Newspaper size={10} className="news-feed-item-info-icon" /> 
                      <span className="news-feed-item-newspaper">{event.newspaper}</span>
                    </div>
                    <div className="news-feed-item-info-row">
                      <User size={10} className="news-feed-item-info-icon" /> 
                      <span className="news-feed-item-author">{event.author}</span>
                    </div>
                    <div className="news-feed-item-info-row">
                      <Calendar size={10} className="news-feed-item-info-icon" /> 
                         {/* WARNING REMOVE YEAR ON DATE - FOR SHORT TERMS ONLY ? GAIN PLACE */}
                      <span>{event.date.slice(0, -9).replace(/\d{4}/,"")}</span>
                    </div>
                    <div className="news-feed-item-info-row">
                      <MapPin size={10} className="news-feed-item-info-icon" /> 
                      <span>{event.location}</span>
                    </div>
                    </Grid>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading indicator and observer target */}
          {visibleEvents.length < newsEvents.length && (
            <div className="loader-container" ref={loaderRef}>
              {loading ? (
                <div className="news-feed-loader">
                  <div className="news-feed-loader-dot"></div>
                  <div className="news-feed-loader-dot"></div>
                  <div className="news-feed-loader-dot"></div>
                </div>
              ) : (
                <button className="load-more-button" onClick={loadMoreEvents}>
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