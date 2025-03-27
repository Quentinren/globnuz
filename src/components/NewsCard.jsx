import React, { useState } from 'react';
import { ExternalLink, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

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
      externalLink: "https://example.com/news/climate-summit",
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
      externalLink: "https://example.com/news/marine-sanctuary",
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
      externalLink: "https://example.com/news/tech-conference",
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
      externalLink: "https://example.com/news/egypt-discovery",
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
      externalLink: "https://example.com/news/amazon-conservation",
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

  // Generate gradient based on index
  const gradients = [
    'from-blue-500 to-purple-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-yellow-500 to-amber-500',
    'from-emerald-500 to-green-600'
  ];

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
      <div className="relative overflow-hidden rounded-xl shadow-2xl">
        {/* Card Header with Gradient */}
        <div className={`bg-gradient-to-r ${gradients[currentIndex]} p-6 text-white`}>
          <h2 className="text-2xl font-bold mb-1">{currentEvent.title}</h2>
          <div className="flex items-center text-sm">
            <span className="font-medium">{currentEvent.newspaper}</span>
            <span className="mx-2">•</span>
            <span>{currentEvent.author}</span>
          </div>
        </div>

        {/* Card Image */}
        <div className="h-48 bg-gray-200 relative">
          <img 
            src={currentEvent.image} 
            alt={currentEvent.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Card Content */}
        <div className="p-6 bg-white">
          <p className="text-gray-700 mb-4">{currentEvent.description}</p>
          
          {/* Meta Information */}
          <div className="flex flex-col space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2" /> 
              <span>{currentEvent.date}</span>
            </div>
            <div className="flex items-center">
              <MapPin size={16} className="mr-2" /> 
              <span>Coordinates: {currentEvent.lat.toFixed(2)}, {currentEvent.lng.toFixed(2)}</span>
            </div>
            <a 
              href={currentEvent.externalLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mt-2"
            >
              <ExternalLink size={16} className="mr-2" /> 
              <span>Read full article</span>
            </a>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button 
          onClick={handlePrevious}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
          aria-label="Previous news"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={handleNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
          aria-label="Next news"
        >
          <ChevronRight size={20} />
        </button>

        {/* Pagination Indicator */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {newsEvents.map((_, index) => (
            <div 
              key={index} 
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;