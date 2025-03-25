import React, { useState } from 'react';
import { ExternalLink, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import './NewsCard.css';

const NewsCard = ({ newsEvents, onNavigateToArticle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const currentEvent = newsEvents[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? newsEvents.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === newsEvents.length - 1 ? 0 : prevIndex + 1
    );
  };

  // New function to handle article navigation
  const handleReadArticle = (e) => {
    e.preventDefault(); // Prevent default link behavior
    
    // Navigate to the article's location on the globe
    if (onNavigateToArticle) {
      onNavigateToArticle(currentEvent.lat, currentEvent.lng);
    }
    
    // Optional: Open the article in a new tab
    // window.open(currentEvent.externalLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="news-card-container">
      <div className={`news-card news-card-theme-${currentIndex % 5}`}>
        {/* Card Header */}
        <div className="news-card-header">
          <h2 className="news-card-title">{currentEvent.title}</h2>
          <div className="news-card-source">
            <span className="news-card-newspaper">{currentEvent.newspaper}</span>
            <span className="news-card-separator">•</span>
            <span>{currentEvent.author}</span>
          </div>
        </div>

        {/* Card Image */}
        <div className="news-card-image-container">
          <img 
            src={currentEvent.externalLink} 
            alt={currentEvent.title} 
            className="news-card-image"
          />
        </div>

        {/* Card Content */}
        <div className="news-card-content">
          <p className="news-card-description">{currentEvent.description}</p>
          
          {/* Meta Information */}
          <div className="news-card-meta">
            <div className="news-card-meta-item">
              <Calendar size={16} className="news-card-meta-icon" /> 
              <span>{currentEvent.date}</span>
            </div>
            <div className="news-card-meta-item">
              <MapPin size={16} className="news-card-meta-icon" /> 
              <span>Coordinates: {currentEvent.lat.toFixed(2)}, {currentEvent.lng.toFixed(2)}</span>
            </div>
            <a 
              href={currentEvent.externalLink} 
              onClick={handleReadArticle}
              className="news-card-link"
              style={{ cursor: 'pointer' }}
            >
              <ExternalLink size={16} className="news-card-meta-icon" /> 
              <span>Read full article</span>
            </a>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button 
          onClick={handlePrevious}
          className="news-card-nav-button news-card-prev"
          aria-label="Previous news"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={handleNext}
          className="news-card-nav-button news-card-next"
          aria-label="Next news"
        >
          <ChevronRight size={20} />
        </button>

        {/* Pagination Indicator */}
        <div className="news-card-pagination">
          {newsEvents.map((_, index) => (
            <div 
              key={index} 
              className={`news-card-pagination-dot ${
                index === currentIndex ? 'active' : ''
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;