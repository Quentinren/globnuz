import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { fetchCountriesData, fetchPlacesData } from './services/globeDataService';
import { fetchNewsFromSupabase, fetchCountriesFromSupabase } from './services/newsService';
import Logo from './components/Logo'
import BottomMenu from './components/BottomMenu'
import GlobeDynamic from './components/GlobeDynamic';
import NewsScroll from './components/NewsScroll';
import SlideFilterPanel from './components/SlideFilterPanel'; // Import our new component

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

  // State for the filter panel
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

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
    oceania: false,
    // Source filters
    sourceFilters: {}
  });

  // Reference to store the current selected country
  const [selectedCountry, setSelectedCountry] = useState(null);
  
  // Fetch news when component mounts or filters change
  useEffect(() => {
    let isMounted = true;
    const fetchNews = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching news with filters:", newsFilters);
        // Pass filters to the fetchNewsFromSupabase function
        const newsData = await fetchNewsFromSupabase(newsFilters);
        
        if (!isMounted) return;
        
        if (newsData.length === 0) {
          setError("No news data available with current filters. Try adjusting your selection.");
          // Keep the previous data visible but grayed out
          setFilteredNewsEvents(prev => 
            prev.map(item => ({ ...item, filtered: true }))
          );
        } else {
          setNewsEvents(newsData);
          setFilteredNewsEvents(newsData);
          // Clear any previous error
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching news from Supabase:", error);
        if (isMounted) {
          setError(`Failed to load news data: ${error.message}`);
          // Keep showing previous data
          setFilteredNewsEvents(prev => prev);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchNews();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [newsFilters]); // Re-fetch when filters change
  
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

  // Log the fetched data
  useEffect(() => {
    console.log("All news events:", newsEvents);
    console.log("Filtered news events:", filteredNewsEvents);
    console.log("countries:", countries);
    console.log("Current filters:", newsFilters);
  }, [newsEvents, filteredNewsEvents, countries, newsFilters]);

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

  // Function to handle news filter changes
  const handleNewsFiltersChange = (filters) => {
    setNewsFilters(filters);
    
    // This will trigger the useEffect to fetch news with updated filters
    console.log("Filter update:", filters);
  };

  // Toggle filter panel
  const toggleFilterPanel = (isOpen) => {
    setIsFilterPanelOpen(isOpen);
  };

  // Handle country click on the globe
  const handleCountryClick = (countryData) => {
    console.log("Country clicked in App.jsx:", countryData);
    
    // Store the selected country
    setSelectedCountry(countryData);
    
    // Create a new filter with this country
    const updatedFilters = {
      ...newsFilters,
      sourceFilters: {
        ...newsFilters.sourceFilters,
        [countryData.code]: !newsFilters.sourceFilters[countryData.code]
      }
    };
    
    // Display feedback to the user
    if (!newsFilters.sourceFilters[countryData.code]) {
      // Add country filter
      setError(`Filtering news by sources from ${countryData.name}`);
    } else {
      // Remove country filter
      setError(`Removed filter for news from ${countryData.name}`);
    }
    
    // Update filters, which will trigger a news fetch
    setNewsFilters(updatedFilters);
    
    // Also show the filter panel with the new selection
    setTimeout(() => {
      setIsFilterPanelOpen(true);
    }, 1000);
  };

  return (
    <div className={`app-container ${isSubmenuOpen || isFilterPanelOpen ? 'submenu-open' : ''}`}>
      {/* Logo */}
      <Logo />
      
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
          onCountryClick={handleCountryClick}
        />
      )}
      
      {/* Sliding Filter Panel */}
      <SlideFilterPanel
        onNewsFiltersChange={handleNewsFiltersChange}
        newsFilters={newsFilters}
        countries={countries}
        isOpen={isFilterPanelOpen}
        onToggle={toggleFilterPanel}
        selectedCountry={selectedCountry}
      />
      
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