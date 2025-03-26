import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { fetchCountriesData, fetchPlacesData } from './services/globeDataService';
import Logo from './components/Logo'
import BottomMenu from './components/BottomMenu'
import GlobeDynamic from './components/GlobeDynamic';
import CustomNewsScroll from './components/CustomNewsScroll'; // Import our new component

function App() {
  // State to manage submenu opening
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  
  // New state to track selected coordinates for the globe
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);

  // Sample news events data
  const newsEvents = [
    {
      "title": "Firefly Aerospace Achieves Historic Moon Landing",
      "description": "Firefly Aerospace becomes the first commercial company to successfully land on the Moon without technical issues.",
      "author": "Space News Reporter",
      "newspaper": "Space Daily",
      "image": "https://example.com/images/firefly-moon-landing.jpg",
      "externalLink": "https://picsum.photos/800/800",
      "date": "March 2, 2025",
      "lat": 0.6741,
      "lng": 23.4729
    },
    {
      "title": "Trump Administration Pauses Military Aid to Ukraine",
      "description": "The U.S. pauses military aid to Ukraine following a meeting between President Trump and President Zelenskyy.",
      "author": "Political Correspondent",
      "newspaper": "Global Politics",
      "image": "https://example.com/images/trump-zelenskyy-meeting.jpg",
      "externalLink": "https://picsum.photos/900/900",
      "date": "March 3, 2025",
      "lat": 38.8977,
      "lng": -77.0365
    },
    {
      "title": "Colossal Biosciences Creates Woolly Mice",
      "description": "Scientists create genetically modified mice with woolly mammoth traits as part of de-extinction efforts.",
      "author": "Science Journalist",
      "newspaper": "BioTech Times",
      "image": "https://example.com/images/woolly-mice.jpg",
      "externalLink": "https://picsum.photos/800/200",
      "date": "March 4, 2025",
      "lat": 42.3601,
      "lng": -71.0589
    },
    {
      "title": "Sudan Files Genocide Case Against UAE",
      "description": "Sudan files a case against the UAE at the International Court of Justice, alleging complicity in genocide.",
      "author": "International Affairs Analyst",
      "newspaper": "World News",
      "image": "https://example.com/images/sudan-icj-case.jpg",
      "externalLink": "https://picsum.photos/500/800",
      "date": "March 5, 2025",
      "lat": 52.0800,
      "lng": 4.3245
    },
    {
      "title": "Over 1,000 Killed in Syrian Crackdown",
      "description": "Syrian government forces kill over 1,000 people in a crackdown in the Alawite region.",
      "author": "Middle East Correspondent",
      "newspaper": "Daily News",
      "image": "https://example.com/images/syrian-crackdown.jpg",
      "externalLink": "https://picsum.photos/300/800",
      "date": "March 8, 2025",
      "lat": 35.0000,
      "lng": 38.0000
    }
  ];
  
  // Function to handle navigation from NewsCard or CustomNewsScroll
  const handleNavigateToArticle = (lat, lng) => {
    setSelectedCoordinates({ lat, lng });
  };

  // Custom event handler for submenu state
  const handleSubmenuToggle = (isOpen) => {
    setIsSubmenuOpen(isOpen);
  };

  return (
    <div className={`app-container ${isSubmenuOpen ? 'submenu-open' : ''}`}>
      {/* Logo */}
      <Logo/>
      
      {/* Our new CustomNewsScroll component */}
      <CustomNewsScroll 
        newsEvents={newsEvents}
        onNavigateToArticle={handleNavigateToArticle}
      />
      
      {/* Globe */}
      <GlobeDynamic 
        newsEvents={newsEvents}
        navigateToCoordinates={selectedCoordinates} 
      />
      
      {/* Menus */}
      <BottomMenu onSubmenuToggle={handleSubmenuToggle} />
      
      {/* Gradient overlay */}
      <div className="gradient-overlay"></div>
    </div>
  );
}

export default App;