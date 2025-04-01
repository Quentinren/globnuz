import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { fetchCountriesData, fetchPlacesData } from './services/globeDataService';
import { fetchNewsFromSupabase, fetchCountriesFromSupabase } from './services/supabaseService'; // Import the new Supabase service
import Logo from './components/Logo'
import BottomMenu from './components/BottomMenu'
import GlobeDynamic from './components/GlobeDynamic';
import NewsScroll from './components/NewsScroll'; // Import our new component

function App() {
  // State to manage submenu opening
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  // State to track the active title for scrolling
  const [activeNewsTitle, setActiveNewsTitle] = useState(null);
  
  // New state to track selected coordinates for the globe
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  
  // State to store news events data
  const [newsEvents, setNewsEvents] = useState([]);

  // State to store news events data
  const [countries, setCountries] = useState([]);  
  
  // State for loading status and error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch news from Supabase on component mount
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const newsData = await fetchNewsFromSupabase();
        if (newsData.length === 0) {
          setError("No news data available. Using fallback data.");
          // Fallback to sample data if API returns empty
         
        } else {
          setNewsEvents(newsData);
        }
      } catch (error) {
        console.error("Error fetching news from Supabase:", error);
        setError(`Failed to load news data: ${error.message}`);
     
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNews();
  }, []);
  
    // Fetch news from Supabase on component mount
    useEffect(() => {
      const fetchCountriesData = async () => {
        try {
          const countriesData = await fetchCountriesFromSupabase();
          if (countriesData.length === 0) {
            setError("No news data available. Using fallback data.");
            // Fallback to sample data if API returns empty
           
          } else {
            setCountries(countriesData);
          }
        } catch (error) {
          console.error("Error fetching news from Supabase:", error);
          setError(`Failed to load news data: ${error.message}`);
        } 
      };
      fetchCountriesData();
    }, []);

  // Log the fetched or fallback news events
  useEffect(() => {
    console.log("events: ", newsEvents);
    console.log("countries: ", countries);
  }, [newsEvents]);

  // Handler for when a globe label is clicked
  const handleGlobeLabelClick = (title) => {
    setActiveNewsTitle(title);
  };
  
  // Function to handle navigation from NewsCard or NewsScroll
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
      
      {/* Error message */}
      {error && !isLoading && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading news data...</p>
        </div>
      )}
      
      {/* Our NewsScroll component - only shown when data is loaded */}
      {!isLoading && newsEvents.length > 0 && (
        <NewsScroll 
          newsEvents={newsEvents}
          onNavigateToArticle={handleNavigateToArticle}
          activeTitle={activeNewsTitle}
        />
      )}
      
      {/* Globe - only load with real data or dummy data */}
      {!isLoading && (
        <GlobeDynamic 
          newsEvents={newsEvents}
          navigateToCoordinates={selectedCoordinates} 
          onLabelClick={handleGlobeLabelClick}
        />
      )}
      
      {/* Menus */}
      <BottomMenu onSubmenuToggle={handleSubmenuToggle} />
      
      {/* Gradient overlay - moved to end to ensure proper layering */}
      <div className="gradient-overlay"></div>
    </div>
  );
}

export default App;