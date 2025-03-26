// BottomMenu.jsx - Complete version with consistent submenu positioning
import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Thermometer, 
  Cloud, 
  Wind, 
  ActivitySquare, 
  Globe,
  X,
  Satellite,
  Plus,
  Minus,
  Map,
  Bookmark,
  Filter,
  Calendar,
  Building,
  HeartPulse,
  TestTube,
  MoreHorizontal,
  Earth,
  MapPin
} from 'lucide-react';
import './BottomMenu.css';

const BottomMenu = ({ onSubmenuToggle, onGetUserLocation }) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [layerToggles, setLayerToggles] = useState({
    temperature: false,
    clouds: false,
    earthquakes: false,
    wind: false,
    events: false
  });
  
  const [newsFilters, setNewsFilters] = useState({
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

  // Layer options
  const layerOptions = [
    { id: 'temperature', label: 'Temperature', icon: <Thermometer size={20} /> },
    { id: 'clouds', label: 'Clouds', icon: <Cloud size={20} /> },
    { id: 'earthquakes', label: 'Earthquakes', icon: <ActivitySquare size={20} /> },
    { id: 'wind', label: 'Wind', icon: <Wind size={20} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={20} /> }
  ];

  // News categories
  const newsCategories = [
    { id: 'environment', label: 'Environment', icon: <Earth size={20} /> },
    { id: 'politics', label: 'Politics', icon: <Building size={20} /> },
    { id: 'health', label: 'Health', icon: <HeartPulse size={20} /> },
    { id: 'science', label: 'Science', icon: <TestTube size={20} /> },
    { id: 'technology', label: 'Technology', icon: <Globe size={20} /> },
    { id: 'other', label: 'Other', icon: <MoreHorizontal size={20} /> }
  ];

  // Region filters
  const regionFilters = [
    { id: 'africa', label: 'Africa' },
    { id: 'americas', label: 'Americas' },
    { id: 'asia', label: 'Asia' },
    { id: 'europe', label: 'Europe' },
    { id: 'oceania', label: 'Oceania' }
  ];

  useEffect(() => {
    // Notify parent component about submenu state changes
    if (onSubmenuToggle) {
      onSubmenuToggle(activeSubmenu !== null || activeFilter !== null);
    }
  }, [activeSubmenu, activeFilter, onSubmenuToggle]);

  const toggleSubmenu = (menuId) => {
    // Close filter submenu when toggling main submenu
    setActiveFilter(null);
    setActiveSubmenu(activeSubmenu === menuId ? null : menuId);
  };

  const toggleFilterSubmenu = (filterId) => {
    setActiveFilter(activeFilter === filterId ? null : filterId);
  };

  const closeSubmenu = () => {
    setActiveSubmenu(null);
    setActiveFilter(null);
  };

  const toggleLayer = (layerId) => {
    setLayerToggles(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  const toggleNewsFilter = (filterId) => {
    setNewsFilters(prev => ({
      ...prev,
      [filterId]: !prev[filterId]
    }));
  };

  const handleZoomIn = () => {
    // This would be handled in your globe component
    console.log('Zoom in');
  };

  const handleZoomOut = () => {
    // This would be handled in your globe component
    console.log('Zoom out');
  };
  
  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('User location:', latitude, longitude);
          if (onGetUserLocation) {
            onGetUserLocation(latitude, longitude);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to retrieve your location. Please check your browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Get currently active layers for display
  const getActiveLayers = () => {
    return Object.entries(layerToggles)
      .filter(([_, isActive]) => isActive)
      .map(([key]) => key);
  };

  const activeLayers = getActiveLayers();

  return (
    <>
      {/* Bottom Menu */}
      <div className="bottom-menu-container">
        <div className="bottom-menu">
          <div 
            className={`menu-item ${activeSubmenu === 'layers' ? 'active' : ''}`}
            onClick={() => toggleSubmenu('layers')}
          >
            <Layers size={24} />
          </div>
          <div 
            className={`menu-item ${activeSubmenu === 'bookmarks' ? 'active' : ''}`}
            onClick={() => toggleSubmenu('bookmarks')}
          >
            <Bookmark size={24} />
          </div>
          <div 
            className={`menu-item ${activeSubmenu === 'map' ? 'active' : ''}`}
            onClick={() => toggleSubmenu('map')}
          >
            <Map size={24} />
          </div>
          <div 
            className={`menu-item ${activeSubmenu === 'location' ? 'active' : ''}`}
            onClick={handleGetUserLocation}
          >
            <MapPin size={24} />
          </div>
        </div>
        
        {/* Layers Submenu */}
        {activeSubmenu === 'layers' && (
          <div className="submenu-card">
            <div className="submenu-header">
              <div className="submenu-title">Layers</div>
              <button className="close-button" onClick={closeSubmenu}>
                <X size={20} />
              </button>
            </div>
            <div className="submenu-content">
              {layerOptions.map(layer => (
                <div 
                  key={layer.id} 
                  className={`submenu-item ${layerToggles[layer.id] ? 'active' : ''}`}
                  onClick={() => toggleLayer(layer.id)}
                >
                  <div className="submenu-item-icon">{layer.icon}</div>
                  <div className="submenu-item-label">{layer.label}</div>
                  <div className={`submenu-item-toggle ${layerToggles[layer.id] ? 'active' : ''}`}></div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Bookmarks Submenu */}
        {activeSubmenu === 'bookmarks' && (
          <div className="submenu-card">
            <div className="submenu-header">
              <div className="submenu-title">Bookmarks</div>
              <button className="close-button" onClick={closeSubmenu}>
                <X size={20} />
              </button>
            </div>
            <div className="submenu-content">
              <div className="empty-state">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Bookmark size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                  <div>No saved locations</div>
                  <div style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '5px' }}>
                    Bookmarked locations will appear here
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
        
    {/* Map Submenu - Fixed class for proper positioning */}
    {activeSubmenu === 'map' && (
        <div className="submenu-card map-submenu">
          <div className="submenu-header">
            <div className="submenu-title">Map Options</div>
            <button className="close-button" onClick={closeSubmenu}>
              <X size={20} />
            </button>
          </div>
          <div className="submenu-content">
            <div 
              className="submenu-item"
              onClick={() => console.log('Satellite view selected')}
            >
              <div className="submenu-item-icon"><Satellite size={20} /></div>
              <div className="submenu-item-label">Satellite</div>
            </div>
            <div 
              className="submenu-item"
              onClick={() => console.log('Street view selected')}
            >
              <div className="submenu-item-icon"><Map size={20} /></div>
              <div className="submenu-item-label">Street</div>
            </div>
            <div 
              className="submenu-item"
              onClick={() => console.log('3D view selected')}
            >
              <div className="submenu-item-icon"><Globe size={20} /></div>
              <div className="submenu-item-label">3D</div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="zoom-controls">
        <div className="zoom-button" onClick={handleZoomIn}>
          <Plus size={24} />
        </div>
        <div className="zoom-button" onClick={handleZoomOut}>
          <Minus size={24} />
        </div>
      </div>

      {/* Filter Button */}
      <div 
        className={`filter-button ${activeSubmenu === 'news' ? 'active' : ''}`}
        onClick={() => toggleSubmenu('news')}
      >
        <Filter size={24} />
      </div>

      {/* News Submenu */}
      {activeSubmenu === 'news' && (
        <div className="submenu-card news-submenu">
          <div className="submenu-header">
            <div className="submenu-title">News Filters</div>
            <button className="close-button" onClick={closeSubmenu}>
              <X size={20} />
            </button>
          </div>
          <div className="submenu-content">
            <div className="submenu-category">Categories</div>
            {newsCategories.map(category => (
              <div 
                key={category.id} 
                className={`submenu-item ${newsFilters[category.id] ? 'active' : ''}`}
                onClick={() => toggleNewsFilter(category.id)}
              >
                <div className="submenu-item-icon">{category.icon}</div>
                <div className="submenu-item-label">{category.label}</div>
              </div>
            ))}
            
            {/* Regions section with filter button */}
            <div className="submenu-category">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Regions</span>
                <button 
                  className={`submenu-filter-button ${activeFilter === 'regions' ? 'active' : ''}`}
                  onClick={() => toggleFilterSubmenu('regions')}
                  aria-label="Filter regions"
                >
                  <Filter size={16} />
                </button>
              </div>
            </div>
            
            {/* Region filter submenu */}
            {activeFilter === 'regions' && (
              <div className="submenu-card region-submenu">
                <div className="submenu-header">
                  <div className="submenu-title">Regions</div>
                  <button className="close-button" onClick={() => setActiveFilter(null)}>
                    <X size={16} />
                  </button>
                </div>
                <div className="submenu-content">
                  {regionFilters.map(region => (
                    <div 
                      key={region.id} 
                      className={`submenu-item ${newsFilters[region.id] ? 'active' : ''}`}
                      onClick={() => toggleNewsFilter(region.id)}
                    >
                      <div className="submenu-item-label">{region.label}</div>
                      <div className={`submenu-item-toggle ${newsFilters[region.id] ? 'active' : ''}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BottomMenu;