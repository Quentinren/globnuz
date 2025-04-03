// SlideFilterPanel.jsx - Updated with country selection support
import React, { useState, useEffect, useRef } from 'react';
import { 
  Filter, 
  X, 
  Earth, 
  Building, 
  HeartPulse, 
  TestTube, 
  Globe, 
  MoreHorizontal,
  Newspaper,
  MapPin,
  AlertCircle
} from 'lucide-react';
import './SlideFilterPanel.css';

const SlideFilterPanel = ({ 
  onNewsFiltersChange, 
  newsFilters = {}, 
  countries = [],
  isOpen, 
  onToggle,
  selectedCountry = null
}) => {
  // Initialize local state from props or with defaults
  const [localNewsFilters, setLocalNewsFilters] = useState({
    // Categories
    environment: newsFilters.environment || false,
    politics: newsFilters.politics || false,
    health: newsFilters.health || false,
    science: newsFilters.science || false,
    technology: newsFilters.technology || false,
    other: newsFilters.other || false,
    // Regions
    africa: newsFilters.africa || false,
    americas: newsFilters.americas || false,
    asia: newsFilters.asia || false,
    europe: newsFilters.europe || false,
    oceania: newsFilters.oceania || false,
    // Source filters
    sourceFilters: newsFilters.sourceFilters || {}
  });

  // State to track which region is expanded for country selection
  const [expandedRegion, setExpandedRegion] = useState(null);
  
  const panelRef = useRef(null);
  const triggerZoneRef = useRef(null);
  
  // Hover open timer
  const [hoverTimer, setHoverTimer] = useState(null);

  // Update local state when props change
  useEffect(() => {
    setLocalNewsFilters(prevFilters => ({
      ...prevFilters,
      ...newsFilters
    }));
  }, [newsFilters]);

  // React to selectedCountry changes
  useEffect(() => {
    if (selectedCountry) {
      // Find which region this country belongs to and expand it
      const countryRegion = findCountryRegion(selectedCountry.code);
      if (countryRegion) {
        setExpandedRegion(countryRegion);
      }
    }
  }, [selectedCountry]);

  // Function to determine which region a country belongs to
  const findCountryRegion = (countryCode) => {
    if (!countryCode) return null;
    
    // Define country codes by region for lookup
    const regionCountryCodes = {
      africa: ['DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CV', 'CF', 'TD', 'KM', 'CG', 'CD', 'DJ', 'EG', 'GQ', 'ER', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'CI', 'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'SZ', 'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW'],
      americas: ['AI', 'AG', 'AR', 'AW', 'BS', 'BB', 'BZ', 'BM', 'BO', 'BR', 'CA', 'KY', 'CL', 'CO', 'CR', 'CU', 'DM', 'DO', 'EC', 'SV', 'FK', 'GF', 'GL', 'GD', 'GP', 'GT', 'GY', 'HT', 'HN', 'JM', 'MQ', 'MX', 'MS', 'NI', 'PA', 'PY', 'PE', 'PR', 'BL', 'KN', 'LC', 'MF', 'PM', 'VC', 'SR', 'TT', 'TC', 'US', 'UY', 'VE', 'VG', 'VI'],
      asia: ['AF', 'AM', 'AZ', 'BH', 'BD', 'BT', 'BN', 'KH', 'CN', 'CY', 'GE', 'HK', 'IN', 'ID', 'IR', 'IQ', 'IL', 'JP', 'JO', 'KZ', 'KP', 'KR', 'KW', 'KG', 'LA', 'LB', 'MO', 'MY', 'MV', 'MN', 'MM', 'NP', 'OM', 'PK', 'PS', 'PH', 'QA', 'SA', 'SG', 'LK', 'SY', 'TW', 'TJ', 'TH', 'TL', 'TR', 'TM', 'AE', 'UZ', 'VN', 'YE'],
      europe: ['AL', 'AD', 'AT', 'BY', 'BE', 'BA', 'BG', 'HR', 'CZ', 'DK', 'EE', 'FO', 'FI', 'FR', 'DE', 'GI', 'GR', 'GG', 'VA', 'HU', 'IS', 'IE', 'IM', 'IT', 'JE', 'LV', 'LI', 'LT', 'LU', 'MT', 'MD', 'MC', 'ME', 'NL', 'MK', 'NO', 'PL', 'PT', 'RO', 'RU', 'SM', 'RS', 'SK', 'SI', 'ES', 'SJ', 'SE', 'CH', 'UA', 'GB'],
      oceania: ['AS', 'AU', 'CK', 'FJ', 'PF', 'GU', 'KI', 'MH', 'FM', 'NR', 'NC', 'NZ', 'NU', 'NF', 'MP', 'PW', 'PG', 'PN', 'WS', 'SB', 'TK', 'TO', 'TV', 'VU', 'WF']
    };
    
    // Check which region contains this country code
    for (const [region, codes] of Object.entries(regionCountryCodes)) {
      if (codes.includes(countryCode)) {
        return region;
      }
    }
    
    return null;
  };

  // News categories
  const newsCategories = [
    { id: 'environment', label: 'Environment', icon: <Earth size={20} /> },
    { id: 'politics', label: 'Politics', icon: <Building size={20} /> },
    { id: 'health', label: 'Health', icon: <HeartPulse size={20} /> },
    { id: 'science', label: 'Science', icon: <TestTube size={20} /> },
    { id: 'technology', label: 'Technology', icon: <Globe size={20} /> },
    { id: 'other', label: 'Other', icon: <MoreHorizontal size={20} /> }
  ];

  // Region filters with flags
  const regionFilters = [
    { 
      id: 'africa', 
      label: 'Africa',
      flagSrc: 'https://flagcdn.com/za.svg', // South Africa as representative
      countries: countries.filter(c => {
        const africanCodes = ['DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CV', 'CF', 'TD', 'KM', 'CG', 'CD', 'DJ', 'EG', 'GQ', 'ER', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'CI', 'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'SZ', 'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW'];
        return africanCodes.includes(c.country_id);
      })
    },
    { 
      id: 'americas', 
      label: 'Americas',
      flagSrc: 'https://flagcdn.com/us.svg', // USA as representative
      countries: countries.filter(c => {
        const americasCodes = ['AI', 'AG', 'AR', 'AW', 'BS', 'BB', 'BZ', 'BM', 'BO', 'BR', 'CA', 'KY', 'CL', 'CO', 'CR', 'CU', 'DM', 'DO', 'EC', 'SV', 'FK', 'GF', 'GL', 'GD', 'GP', 'GT', 'GY', 'HT', 'HN', 'JM', 'MQ', 'MX', 'MS', 'NI', 'PA', 'PY', 'PE', 'PR', 'BL', 'KN', 'LC', 'MF', 'PM', 'VC', 'SR', 'TT', 'TC', 'US', 'UY', 'VE', 'VG', 'VI'];
        return americasCodes.includes(c.country_id);
      })
    },
    { 
      id: 'asia', 
      label: 'Asia',
      flagSrc: 'https://flagcdn.com/jp.svg', // Japan as representative
      countries: countries.filter(c => {
        const asiaCodes = ['AF', 'AM', 'AZ', 'BH', 'BD', 'BT', 'BN', 'KH', 'CN', 'CY', 'GE', 'HK', 'IN', 'ID', 'IR', 'IQ', 'IL', 'JP', 'JO', 'KZ', 'KP', 'KR', 'KW', 'KG', 'LA', 'LB', 'MO', 'MY', 'MV', 'MN', 'MM', 'NP', 'OM', 'PK', 'PS', 'PH', 'QA', 'SA', 'SG', 'LK', 'SY', 'TW', 'TJ', 'TH', 'TL', 'TR', 'TM', 'AE', 'UZ', 'VN', 'YE'];
        return asiaCodes.includes(c.country_id);
      }) 
    },
    { 
      id: 'europe', 
      label: 'Europe',
      flagSrc: 'https://flagcdn.com/fr.svg', // France as representative
      countries: countries.filter(c => {
        const europeCodes = ['AL', 'AD', 'AT', 'BY', 'BE', 'BA', 'BG', 'HR', 'CZ', 'DK', 'EE', 'FO', 'FI', 'FR', 'DE', 'GI', 'GR', 'GG', 'VA', 'HU', 'IS', 'IE', 'IM', 'IT', 'JE', 'LV', 'LI', 'LT', 'LU', 'MT', 'MD', 'MC', 'ME', 'NL', 'MK', 'NO', 'PL', 'PT', 'RO', 'RU', 'SM', 'RS', 'SK', 'SI', 'ES', 'SJ', 'SE', 'CH', 'UA', 'GB'];
        return europeCodes.includes(c.country_id);
      })
    },
    { 
      id: 'oceania', 
      label: 'Oceania',
      flagSrc: 'https://flagcdn.com/au.svg', // Australia as representative
      countries: countries.filter(c => {
        const oceaniaCodes = ['AS', 'AU', 'CK', 'FJ', 'PF', 'GU', 'KI', 'MH', 'FM', 'NR', 'NC', 'NZ', 'NU', 'NF', 'MP', 'PW', 'PG', 'PN', 'WS', 'SB', 'TK', 'TO', 'TV', 'VU', 'WF'];
        return oceaniaCodes.includes(c.country_id);
      })
    }
  ];

  const toggleNewsFilter = (filterId) => {
    const updatedFilters = {
      ...localNewsFilters,
      [filterId]: !localNewsFilters[filterId]
    };
    
    setLocalNewsFilters(updatedFilters);
    
    // Propagate changes to parent component
    if (onNewsFiltersChange) {
      onNewsFiltersChange(updatedFilters);
    }
  };

  // Toggle specific country filter
  const toggleCountryFilter = (countryId) => {
    const updatedSourceFilters = {
      ...localNewsFilters.sourceFilters,
      [countryId]: !localNewsFilters.sourceFilters[countryId]
    };

    const updatedFilters = {
      ...localNewsFilters,
      sourceFilters: updatedSourceFilters
    };
    
    setLocalNewsFilters(updatedFilters);
    
    // Propagate changes to parent component
    if (onNewsFiltersChange) {
      onNewsFiltersChange(updatedFilters);
    }
  };

  // Toggle region expansion to show countries
  const toggleRegionExpansion = (regionId) => {
    setExpandedRegion(expandedRegion === regionId ? null : regionId);
  };

  // Check if any filter is active
  const isAnyFilterActive = () => {
    // Check category and region filters
    const basicFiltersActive = Object.entries(localNewsFilters)
      .filter(([key]) => key !== 'sourceFilters')
      .some(([_, value]) => value === true);
    
    // Check country filters
    const sourceFiltersActive = localNewsFilters.sourceFilters && 
      Object.values(localNewsFilters.sourceFilters).some(value => value === true);
    
    return basicFiltersActive || sourceFiltersActive;
  };

  // Count active filters
  const getActiveFilterCount = () => {
    const basicFilterCount = Object.entries(localNewsFilters)
      .filter(([key]) => key !== 'sourceFilters')
      .filter(([_, value]) => value === true)
      .length;
    
    const sourceFilterCount = localNewsFilters.sourceFilters ? 
      Object.values(localNewsFilters.sourceFilters).filter(value => value === true).length : 0;
    
    return basicFilterCount + sourceFilterCount;
  };

  // Handle hovering to open the panel
  const handleMouseEnter = () => {
    const timer = setTimeout(() => {
      if (!isOpen) onToggle(true);
    }, 500); // 500ms delay before opening
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
  };

  // Handle touch events for mobile swipe
  const [touchStart, setTouchStart] = useState(null);
  
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };
  
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchEnd - touchStart;
    
    // If swipe right when closed, open
    if (distance > 50 && !isOpen) {
      onToggle(true);
    }
    // If swipe left when open, close
    else if (distance < -50 && isOpen) {
      onToggle(false);
    }
    
    setTouchStart(null);
  };

  // Clear all filters
  const clearAllFilters = () => {
    // Create object with all filter properties set to false
    const resetFilters = Object.keys(localNewsFilters).reduce((acc, key) => {
      if (key === 'sourceFilters') {
        acc[key] = {};
      } else {
        acc[key] = false;
      }
      return acc;
    }, {});
    
    setLocalNewsFilters(resetFilters);
    
    if (onNewsFiltersChange) {
      onNewsFiltersChange(resetFilters);
    }
  };

  // Add touch event handlers for mobile swipe
  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, touchStart]);

  // Status message to show current filter state
  const getFilterStatusMessage = () => {
    const activeCount = getActiveFilterCount();
    if (activeCount === 0) return "No filters active";
    
    const categories = [];
    if (localNewsFilters.environment) categories.push("Environment");
    if (localNewsFilters.politics) categories.push("Politics");
    if (localNewsFilters.health) categories.push("Health");
    if (localNewsFilters.science) categories.push("Science");
    if (localNewsFilters.technology) categories.push("Technology");
    if (localNewsFilters.other) categories.push("Other");
    
    const regions = [];
    if (localNewsFilters.africa) regions.push("Africa");
    if (localNewsFilters.americas) regions.push("Americas");
    if (localNewsFilters.asia) regions.push("Asia");
    if (localNewsFilters.europe) regions.push("Europe");
    if (localNewsFilters.oceania) regions.push("Oceania");
    
    // Check country filters
    const countries = [];
    if (localNewsFilters.sourceFilters) {
      Object.entries(localNewsFilters.sourceFilters)
        .filter(([_, active]) => active)
        .forEach(([countryCode]) => {
          const countryObj = countries.find(c => c.country_id === countryCode);
          if (countryObj) {
            countries.push(countryObj.name);
          } else {
            countries.push(countryCode);
          }
        });
    }
    
    const parts = [];
    if (categories.length > 0) {
      parts.push(`Topics: ${categories.join(', ')}`);
    }
    if (regions.length > 0) {
      parts.push(`Regions: ${regions.join(', ')}`);
    }
    if (countries.length > 0) {
      parts.push(`Countries: ${countries.join(', ')}`);
    }
    
    return parts.join(' • ');
  };

  // Check if there is a selected country to focus on
  const shouldHighlightCountry = (countryCode) => {
    return selectedCountry && selectedCountry.code === countryCode;
  };

  return (
    <>
      {/* Trigger zone for mouse hover */}
      <div 
        className="filter-trigger-zone" 
        ref={triggerZoneRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Filter status message */}
      {isAnyFilterActive() && (
        <div className="filter-status-message">
          {getFilterStatusMessage()}
        </div>
      )}
      
      {/* Filter button */}
      <button 
        className={`slide-filter-button ${isOpen ? 'active' : ''} ${isAnyFilterActive() ? 'filter-active' : ''}`}
        onClick={() => onToggle(!isOpen)}
        aria-label="Toggle filters"
      >
        <Filter size={24} />
        {getActiveFilterCount() > 0 && (
          <div className="filter-badge">{getActiveFilterCount()}</div>
        )}
      </button>
      
      {/* Sliding filter panel */}
      <div 
        className={`slide-filter-panel ${isOpen ? 'open' : ''}`}
        ref={panelRef}
      >
        <div className="filter-panel-header">
          <h2>Filters</h2>
          <button 
            className="close-button" 
            onClick={() => onToggle(false)}
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="filter-panel-content">
          {/* Categories Section */}
          <div className="filter-section">
            <h3 className="filter-section-title">
              <Filter size={16} />
              Categories
            </h3>
            <div className="filter-options">
              {newsCategories.map(category => (
                <div 
                  key={category.id} 
                  className={`filter-option ${localNewsFilters[category.id] ? 'active' : ''}`}
                  onClick={() => toggleNewsFilter(category.id)}
                >
                  <div className="filter-option-icon">{category.icon}</div>
                  <div className="filter-option-label">{category.label}</div>
                  <div className={`filter-toggle ${localNewsFilters[category.id] ? 'active' : ''}`}></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Regions Section */}
          <div className="filter-section">
            <h3 className="filter-section-title">
              <MapPin size={16} />
              Regions
            </h3>
            <div className="filter-options">
              {regionFilters.map(region => (
                <div key={region.id}>
                  <div 
                    className={`filter-option ${localNewsFilters[region.id] ? 'active' : ''}`}
                  >
                    <div className="filter-option-icon">
                      <img 
                        src={region.flagSrc} 
                        alt={`${region.label} flag`} 
                        className="region-flag"
                      />
                    </div>
                    <div 
                      className="filter-option-label"
                      onClick={() => toggleNewsFilter(region.id)}
                    >
                      {region.label}
                    </div>
                    <div 
                      className={`filter-toggle ${localNewsFilters[region.id] ? 'active' : ''}`}
                      onClick={() => toggleNewsFilter(region.id)}
                    ></div>
                    <button
                      className={`expand-button ${expandedRegion === region.id ? 'expanded' : ''}`}
                      onClick={() => toggleRegionExpansion(region.id)}
                      aria-label={`${expandedRegion === region.id ? 'Collapse' : 'Expand'} ${region.label} countries`}
                    >
                      {expandedRegion === region.id ? 
                        <span className="chevron-up">▲</span> : 
                        <span className="chevron-down">▼</span>}
                    </button>
                  </div>
                  
                  {/* Countries Accordion within each region */}
                  {expandedRegion === region.id && (
                    <div className="countries-accordion">
                      <div className="countries-grid">
                        {region.countries.map(country => (
                          <div 
                            key={country.country_id}
                            className={`country-chip ${localNewsFilters.sourceFilters[country.country_id] ? 'active' : ''} ${shouldHighlightCountry(country.country_id) ? 'highlight-animation' : ''}`}
                            onClick={() => toggleCountryFilter(country.country_id)}
                          >
                            <img 
                              src={`https://flagcdn.com/${country.country_id.toLowerCase()}.svg`} 
                              alt={`${country.name} flag`}
                              className="country-flag"
                            />
                            <span>{country.name}</span>
                          </div>
                        ))}
                        
                        {region.countries.length === 0 && (
                          <div className="no-countries-message">
                            <AlertCircle size={16} />
                            <span>No countries available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* News Source Section */}
          <div className="filter-section">
            <h3 className="filter-section-title">
              <Newspaper size={16} />
              News Sources
            </h3>
            <div className="filter-options">
              {/* Add news source filtering options here */}
              <div className="coming-soon">
                Advanced source filtering coming soon
              </div>
            </div>
          </div>
          
          {/* Clear filters button */}
          {isAnyFilterActive() && (
            <button 
              className="clear-all-filters-button"
              onClick={clearAllFilters}
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default SlideFilterPanel;