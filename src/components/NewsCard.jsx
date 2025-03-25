import React, { useState } from 'react';
import { ExternalLink, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import './NewsCard.css';

const NewsCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Sample news events data
  const newsEvents = [
    {
      title: "Climate Summit Reaches Historic Agreement",
      description: "World leaders agreed on ambitious targets to reduce carbon emissions by 50% by 2030.",
      author: "Jane Smith",
      newspaper: "Global News",
      image: "/api/placeholder/400/250",
      externalLink: "https://picsum.photos/200/300",
      date: "March 22, 2025",
      lat: 48.8566,
      lng: 2.3522 // Paris
    },
    {
      title: "New Marine Sanctuary Established",
      description: "The world's largest marine protected area has been designated in the Pacific Ocean.",
      author: "John Doe",
      newspaper: "Ocean Times",
      image: "/api/placeholder/400/250",
      externalLink: "https://picsum.photos/200/300",
      date: "March 15, 2025",
      lat: -8.5,
      lng: -124.5 // Pacific Ocean
    },
    {
      title: "Tech Conference Showcases AI Innovations",
      description: "Leading technology companies revealed breakthrough AI systems that can solve complex problems.",
      author: "Robert Chen",
      newspaper: "Tech Daily",
      image: "/api/placeholder/400/250",
      externalLink: "https://picsum.photos/200/300",
      date: "March 20, 2025",
      lat: 37.7749,
      lng: -122.4194 // San Francisco
    },
    {
      title: "Archaeological Discovery in Egypt",
      description: "Archaeologists have uncovered a previously unknown tomb with remarkable artifacts.",
      author: "Sarah Johnson",
      newspaper: "History Today",
      image: "/api/placeholder/400/250",
      externalLink: "https://picsum.photos/200/300",
      date: "March 18, 2025",
      lat: 25.6872,
      lng: 32.6396 // Luxor
    },
    {
      title: "Amazon Rainforest Conservation Initiative",
      description: "New program launched to protect 1 million hectares of rainforest from deforestation.",
      author: "Carlos Mendes",
      newspaper: "Environment Journal",
      image: "/api/placeholder/400/250",
      externalLink: "https://picsum.photos/200/300",
      date: "March 21, 2025",
      lat: -3.4653,
      lng: -62.2159 // Amazon Rainforest
    }
  ];

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
              target="_blank" 
              rel="noopener noreferrer"
              className="news-card-link"
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