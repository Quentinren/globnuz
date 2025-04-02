import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { fetchCountriesData, fetchPlacesData } from './services/globeDataService';
import { fetchNewsFromSupabase, fetchCountriesFromSupabase } from './services/newsService'; // Import the Supabase service
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
  // State to store filtered news events
  const [filteredNewsEvents, setFilteredNewsEvents] = useState([]);

  // State to store news events data
  const [countries, setCountries] = useState([]);  
  
  // State for loading status and error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State to store selected news filters
  const [newsFilters, setNewsFilters] = useState({
    // Categories
    environment: false,
    politics: false,
    health: false,
    science: false,
    technology: false,
    other: false,
    // Regions
    africa: false,
    americas: false,
    asia: false,
    europe: false,
    oceania: false
  });
  

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const newsData = await fetchNewsFromSupabase();
        if (newsData.length === 0) {
          setError("No news data available. Using fallback data.");
        } else {
          setNewsEvents(newsData);
          setFilteredNewsEvents(newsData); // Initialize filtered news with all news
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
  
  // Fetch countries from Supabase on component mount
  useEffect(() => {
    const fetchCountriesData = async () => {
      try {
        const countriesData = await fetchCountriesFromSupabase();
        if (countriesData.length === 0) {
          setError("No countries data available.");
        } else {
          setCountries(countriesData);
        }
      } catch (error) {
        console.error("Error fetching countries from Supabase:", error);
        setError(`Failed to load countries data: ${error.message}`);
      } 
    };
    fetchCountriesData();
  }, []);

  // Helper function to check if any filter is active
  const isAnyFilterActive = () => {
    return Object.values(newsFilters).some(value => value === true);
  };

  // Log the fetched data
  useEffect(() => {
    console.log("All news events:", newsEvents);
    console.log("Filtered news events:", filteredNewsEvents);
    console.log("countries:", countries);
  }, [newsEvents, filteredNewsEvents, countries]);

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

  // Function to handle news filter changes from BottomMenu
  const handleNewsFiltersChange = (filters) => {
    setNewsFilters(filters);
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
      {!isLoading && filteredNewsEvents.length > 0 && (
        <NewsScroll 
          newsEvents={filteredNewsEvents}
          onNavigateToArticle={handleNavigateToArticle}
          activeTitle={activeNewsTitle}
        />
      )}
      
      {/* Globe - only load with real data */}
      {!isLoading && (
        <GlobeDynamic 
          newsEvents={filteredNewsEvents}
          navigateToCoordinates={selectedCoordinates} 
          onLabelClick={handleGlobeLabelClick}
        />
      )}
      
      {/* Menus */}
      <BottomMenu 
        onSubmenuToggle={handleSubmenuToggle} 
        onNewsFiltersChange={handleNewsFiltersChange}
        newsFilters={newsFilters}
      />
      
      {/* Gradient overlay */}
      <div className="gradient-overlay"></div>
    </div>
  );
}

export default App;