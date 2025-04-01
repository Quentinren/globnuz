import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { fetchCountriesData, fetchPlacesData } from './services/globeDataService';
import { fetchNewsFromSupabase } from './services/supabaseService'; // Import the new Supabase service
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
          setNewsEvents([
            {
              "title": "Au procès Sarkozy-Kadhafi",
              "subtitle": "le parquet requiert sept ans de prison et 300 000 euros d'amende contre l'ancien président",
              "description": "Nicolas Sarkozy a dénoncé l'outrance de la peine réclamée par les procureurs, qui l'ont dépeint en commanditaire d'un pacte de corruption inconcevable, inouï, indécent noué avec l'ex-dictateur Mouammar Kadhafi. Des peines de prison ont aussi été requises contre Claude Guéant, Brice Hortefeux et Eric Woerth.",
              "author": "Le Monde",
              "newspaper": "Le Monde",
              "theme": "society",
              "themeTags": ["justice", "politics", "corruption"],
              "image": "https://img.lemde.fr/2025/03/27/348/0/4208/2104/644/322/60/0/51c3e89_ftp-import-images-1-boqg7ohsn7pg-2025-03-27t162408z-719012113-rc2rldaiyhgi-rtrmadp-3-france-politics-sarkozy-trial.JPG",
              "externalLink": "https://www.lemonde.fr/societe/article/2025/03/27/proces-sarkozy-kadhafi-le-parquet-requiert-sept-ans-de-prison-et-300-000-euros-d-amende-contre-l-ex-president-de-la-republique_6586809_3224.html",
              "date": "Thu, 27 Mar 2025 16:52:20 +0100",
              "location": "Paris",
              "lat": 48.8566,
              "lng": 2.3522,
            },
            {
              "title": "En direct, guerre en Ukraine",
              "subtitle": "Volodymyr Zelensky appelle, depuis Paris, les Etats-Unis à réagir après de nouvelles attaques russes",
              "description": "Le président ukrainien a dénoncé la violation d'un moratoire, assez flou, sur les attaques contre les cibles énergétiques. Il a également estimé que la proposition d'une force de réassurance, annoncée par Emmanuel Macron lors du sommet de la coalition des volontaires, posait beaucoup de questions, mais apportait encore peu de réponses.",
              "author": "Le Monde",
              "newspaper": "Le Monde",
              "theme": "geopolitic",
              "themeTags": ["conflict", "war", "ukraine"],
              "image": "https://img.lemde.fr/2025/03/27/468/0/5616/2808/644/322/60/0/e56429a_ftp-import-images-1-dmdjumc5fzzj-879347bd76da40d5a3f03268cbfa6249-0-35e8da7decf34f079d849f729438f14c.jpg",
              "externalLink": "https://www.lemonde.fr/international/live/2025/03/27/en-direct-guerre-en-ukraine-volodymyr-zelensky-appelle-depuis-paris-les-etats-unis-a-reagir-apres-de-nouvelles-frappes-russes_6584822_3210.html",
              "date": "Thu, 27 Mar 2025 17:48:30 +0100",
              "location": "Paris",
              "lat": 48.8566,
              "lng": 2.3522
            },
            {
              "title": "A Gaza",
              "subtitle": "une nouvelle catastrophe humanitaire pour des habitants exténués par la guerre",
              "description": "Des humanitaires s'alarment du blocus en cours et dénoncent l'entrave à leur travail due à l'absence de garanties de sécurité par Israël, alors que les besoins sont immenses.",
              "author": "Le Monde",
              "newspaper": "Le Monde",
              "theme": "geopolitic",
              "themeTags": ["conflict", "humanitarian", "middle-east"],
              "image": "https://img.lemde.fr/2025/03/26/720/0/8640/4320/644/322/60/0/4bcd026_sirius-fs-upload-1-aecd0vidqss0-1743009027277-199424.jpg",
              "externalLink": "https://www.lemonde.fr/international/article/2025/03/27/a-gaza-une-nouvelle-catastrophe-humanitaire-pour-des-habitants-extenues-par-la-guerre_6586811_3210.html",
              "date": "Thu, 27 Mar 2025 17:00:05 +0100",
              "location": "Gaza",
              "lat": 31.5017,
              "lng": 34.4668
            }
            // More fallback items can be added as needed
          ]);
        } else {
          setNewsEvents(newsData);
        }
      } catch (error) {
        console.error("Error fetching news from Supabase:", error);
        setError(`Failed to load news data: ${error.message}`);
        // Fallback to sample data if API fails
        setNewsEvents([
          {
            "title": "Au procès Sarkozy-Kadhafi",
            "subtitle": "le parquet requiert sept ans de prison et 300 000 euros d'amende contre l'ancien président",
            "description": "Nicolas Sarkozy a dénoncé l'outrance de la peine réclamée par les procureurs, qui l'ont dépeint en commanditaire d'un pacte de corruption inconcevable, inouï, indécent noué avec l'ex-dictateur Mouammar Kadhafi. Des peines de prison ont aussi été requises contre Claude Guéant, Brice Hortefeux et Eric Woerth.",
            "author": "Le Monde",
            "newspaper": "Le Monde",
            "theme": "society",
            "themeTags": ["justice", "politics", "corruption"],
            "image": "https://img.lemde.fr/2025/03/27/348/0/4208/2104/644/322/60/0/51c3e89_ftp-import-images-1-boqg7ohsn7pg-2025-03-27t162408z-719012113-rc2rldaiyhgi-rtrmadp-3-france-politics-sarkozy-trial.JPG",
            "externalLink": "https://www.lemonde.fr/societe/article/2025/03/27/proces-sarkozy-kadhafi-le-parquet-requiert-sept-ans-de-prison-et-300-000-euros-d-amende-contre-l-ex-president-de-la-republique_6586809_3224.html",
            "date": "Thu, 27 Mar 2025 16:52:20 +0100",
            "location": "Paris",
            "lat": 48.8566,
            "lng": 2.3522,
          },
          {
            "title": "En direct, guerre en Ukraine",
            "subtitle": "Volodymyr Zelensky appelle, depuis Paris, les Etats-Unis à réagir après de nouvelles attaques russes",
            "description": "Le président ukrainien a dénoncé la violation d'un moratoire, assez flou, sur les attaques contre les cibles énergétiques. Il a également estimé que la proposition d'une force de réassurance, annoncée par Emmanuel Macron lors du sommet de la coalition des volontaires, posait beaucoup de questions, mais apportait encore peu de réponses.",
            "author": "Le Monde",
            "newspaper": "Le Monde",
            "theme": "geopolitic",
            "themeTags": ["conflict", "war", "ukraine"],
            "image": "https://img.lemde.fr/2025/03/27/468/0/5616/2808/644/322/60/0/e56429a_ftp-import-images-1-dmdjumc5fzzj-879347bd76da40d5a3f03268cbfa6249-0-35e8da7decf34f079d849f729438f14c.jpg",
            "externalLink": "https://www.lemonde.fr/international/live/2025/03/27/en-direct-guerre-en-ukraine-volodymyr-zelensky-appelle-depuis-paris-les-etats-unis-a-reagir-apres-de-nouvelles-frappes-russes_6584822_3210.html",
            "date": "Thu, 27 Mar 2025 17:48:30 +0100",
            "location": "Paris",
            "lat": 48.8566,
            "lng": 2.3522
          },
          {
            "title": "A Gaza",
            "subtitle": "une nouvelle catastrophe humanitaire pour des habitants exténués par la guerre",
            "description": "Des humanitaires s'alarment du blocus en cours et dénoncent l'entrave à leur travail due à l'absence de garanties de sécurité par Israël, alors que les besoins sont immenses.",
            "author": "Le Monde",
            "newspaper": "Le Monde",
            "theme": "geopolitic",
            "themeTags": ["conflict", "humanitarian", "middle-east"],
            "image": "https://img.lemde.fr/2025/03/26/720/0/8640/4320/644/322/60/0/4bcd026_sirius-fs-upload-1-aecd0vidqss0-1743009027277-199424.jpg",
            "externalLink": "https://www.lemonde.fr/international/article/2025/03/27/a-gaza-une-nouvelle-catastrophe-humanitaire-pour-des-habitants-extenues-par-la-guerre_6586811_3210.html",
            "date": "Thu, 27 Mar 2025 17:00:05 +0100",
            "location": "Gaza",
            "lat": 31.5017,
            "lng": 34.4668
          }
          // More fallback items can be added as needed
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNews();
  }, []);
  
  // Log the fetched or fallback news events
  useEffect(() => {
    console.log("events: ", newsEvents);
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