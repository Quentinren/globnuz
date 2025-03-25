import React, { useState, useEffect } from 'react';
import { Globe, Calendar, MapPin, Menu, X } from 'lucide-react';
import './NewsCard.css';

const NewsCard = ({ newsEvents, onNavigateToArticle }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  // Close sidebar on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setSidebarVisible(false);
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Handle navigation to article location
  const handleReadArticle = (event, lat, lng) => {
    event.preventDefault();
    
    if (onNavigateToArticle) {
      onNavigateToArticle(lat, lng);
    }
    
    // Optional: Close sidebar after navigation on mobile
    if (window.innerWidth <= 768) {
      setSidebarVisible(false);
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  return (
    <>
      {/* Toggle button */}
      <button 
        className="news-sidebar-toggle" 
        onClick={toggleSidebar}
        aria-label={sidebarVisible ? "Close news sidebar" : "Open news sidebar"}
      >
        {sidebarVisible ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* News Sidebar */}
      <div className={`news-sidebar-container ${sidebarVisible ? '' : 'hidden'}`}>
        <div className="news-events-list">
          {newsEvents.map((event, index) => (
            <div key={index} className={`news-event-card theme-${index % 5}`}>
              {/* Card Header */}
              <div className="news-card-header">
                <h2 className="news-card-title">{event.title}</h2>
                <div className="news-card-source">
                  <span className="news-card-newspaper">{event.newspaper}</span>
                  <span className="news-card-separator">•</span>
                  <span>{event.author}</span>
                </div>
              </div>

              {/* Card Image */}
              <div className="news-card-image-container">
                <img 
                  src={event.externalLink} 
                  alt={event.title} 
                  className="news-card-image"
                />
              </div>

              {/* Card Content */}
              <div className="news-card-content">
                <p className="news-card-description">{event.description}</p>
                
                {/* Meta Information */}
                <div className="news-card-meta">
                  <div className="news-card-meta-item">
                    <Calendar size={16} className="news-card-meta-icon" /> 
                    <span>{event.date}</span>
                  </div>
                  <div className="news-card-meta-item">
                    <MapPin size={16} className="news-card-meta-icon" /> 
                    <span>Coordinates: {event.lat.toFixed(2)}, {event.lng.toFixed(2)}</span>
                  </div>
                  <a 
                    href={event.externalLink} 
                    onClick={(e) => handleReadArticle(e, event.lat, event.lng)}
                    className="news-card-link"
                  >
                    <Globe size={16} className="news-card-meta-icon" /> 
                    <span>Globe location</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NewsCard;