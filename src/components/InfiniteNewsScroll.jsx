// InfiniteNewsScroll.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Globe, ChevronDown, X } from 'lucide-react';
import './InfiniteNewsScroll.css';

const InfiniteNewsScroll = ({ newsEvents, onNavigateToArticle }) => {
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef(null);
  const loaderRef = useRef(null);
  
  const ITEMS_PER_PAGE = 2;
  
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
    <div className={`infinite-news-container ${isOpen ? 'open' : 'closed'}`}>
      <button className="news-toggle-button" onClick={toggleFeed}>
        {isOpen ? <X size={20} /> : <ChevronDown size={20} />}
        {!isOpen && <span>Latest News</span>}
      </button>
      
      <div className="news-feed-wrapper">
        <div className="news-feed-header">
          <h2>Breaking News</h2>
        </div>
        
        <div className="news-feed-content">
          {visibleEvents.map((event, index) => (
            <div key={index} className={`news-feed-item theme-${index % 5}`}>
              <div className="news-feed-item-header">
                <h3 className="news-feed-item-title">{event.title}</h3>
                <div className="news-feed-item-source">
                  <span className="news-feed-item-newspaper">{event.newspaper}</span>
                  <span className="news-feed-item-separator">•</span>
                  <span>{event.author}</span>
                </div>
              </div>
              
              <div className="news-feed-item-image-container">
                <img 
                  src={event.externalLink} 
                  alt={event.title} 
                  className="news-feed-item-image"
                />
              </div>
              
              <div className="news-feed-item-content">
                <p className="news-feed-item-description">{event.description}</p>
                
                <div className="news-feed-item-meta">
                  <div className="news-feed-item-meta-row">
                    <Calendar size={16} className="news-feed-item-meta-icon" /> 
                    <span>{event.date}</span>
                  </div>
                  <div className="news-feed-item-meta-row">
                    <MapPin size={16} className="news-feed-item-meta-icon" /> 
                    <span>Coordinates: {event.lat.toFixed(2)}, {event.lng.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => handleNavigateToArticle(event.lat, event.lng)}
                    className="news-feed-item-locate-button"
                  >
                    <Globe size={16} /> 
                    <span>View on Globe</span>
                  </button>
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

export default InfiniteNewsScroll;