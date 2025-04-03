import React, { useState, useEffect, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import './GlobeDynamic.css';
import '../components/css/news-themes.css'; // Import the theme colors CSS

const GlobeDynamic = ({ newsEvents, navigateToCoordinates, onLabelClick, onCountryClick, onHoverArticle }) => {
  const globeEl = useRef();
  const [globeReady, setGlobeReady] = useState(false);
  const [cameraDistance, setCameraDistance] = useState(0);
  const [countries, setCountries] = useState({ features: []});
  const [countryPolygons, setCountryPolygons] = useState([]);
  
  // Define discrete zoom levels instead of continuous calculations
  const [zoomCategory, setZoomCategory] = useState('medium'); // 'far', 'medium', 'close'
  
  // Use useMemo to maintain stable references to callbacks and computed values
  const globeMaterial = useMemo(() => {
    const material = new THREE.MeshPhongMaterial();
    material.color = new THREE.Color('#003366');
    material.background = new THREE.Color('#003366');
    material.emissiveIntensity = 10;
    material.showGraticules = true;
    material.showAtmosphere = true;
    material.atmosphereColor="rgba(65, 116, 197, 1)"; // Light blue atmosphere
    return material;
  }, []);
  
  // Update zoom category based on camera distance - only when significant changes occur
  useEffect(() => {
    // Only update zoom category when crossing thresholds
    if (cameraDistance > 600 && zoomCategory !== 'far') {
      setZoomCategory('far');
    } else if (cameraDistance <= 600 && cameraDistance > 300 && zoomCategory !== 'medium') {
      setZoomCategory('medium');
    } else if (cameraDistance <= 300 && zoomCategory !== 'close') {
      setZoomCategory('close');
    }
  }, [cameraDistance, zoomCategory]);
  
  // Calculate dynamic label size based on discrete zoom levels
  const getDynamicLabelSize = (baseSize = 1, isCountry = false, isOcean = false, isSmallOcean = false) => {
    // Use predefined sizes based on zoom category
    if (isCountry) {
      switch(zoomCategory) {
        case 'far': return 0; // Hide when far
        case 'medium': return baseSize * 0.6;
        case 'close': return baseSize * 1.2;
        default: return baseSize;
      }
    } 
    else if (isOcean) {
      // Small oceans get smaller labels
      const sizeMultiplier = isSmallOcean ? 0.6 : 1;
      
      switch(zoomCategory) {
        case 'far': return baseSize * 1.5 * sizeMultiplier;
        case 'medium': return baseSize * 1.0 * sizeMultiplier;
        case 'close': return baseSize * 0.5 * sizeMultiplier;
        default: return baseSize * sizeMultiplier;
      }
    } 
    else {
      // News events
      switch(zoomCategory) {
        case 'far': return baseSize * 0.5;
        case 'medium': return baseSize * 0.8;
        case 'close': return baseSize * 1.2;
        default: return baseSize;
      }
    }
  };

  // Get CSS variable for a given theme (memoized for performance)
  const getThemeColor = useMemo(() => (theme) => {
    if (!theme) return '#e74c3c'; // Default to a red color if theme is missing
    
    // Normalize the theme name to match CSS variables
    const normalizedTheme = theme.toLowerCase();
    
    // Get the CSS variable value
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue(`--${normalizedTheme}-color`);
    
    if (cssVar && cssVar.trim()) {
      return cssVar.trim();
    }
    
    // Fallback colors for common themes if CSS variable isn't set
    const fallbackColors = {
      environment: '#2ecc71',
      politics: '#3498db',
      politic: '#3498db',
      geopolitics: '#7fc0ec',
      geopolitic: '#7fc0ec',
      health: '#72e73c',
      science: '#9b59b6',
      technology: '#9512f3',
      economy: '#cbd907',
      society: '#d714a3',
      culture: '#bf6aaf',
      sport: '#27ae60',
      sports: '#27ae60',
      war: '#c0392b',
      conflict: '#c0392b',
      crime: '#cc2e2e',
      disaster: '#e67e22'
    };
    
    return fallbackColors[normalizedTheme] || '#e74c3c'; // Default to red if no match
  }, []);

  // Enhanced goToCoordinates function with smoother transition
  const goToCoordinates = (lat, lng) => {
    if (!globeEl.current) return;
    console.log("Navigating to coordinates:", lat, lng);
    // First get current position
    const currentPov = globeEl.current.pointOfView();
    
    // If we're already zoomed in very close, zoom out a bit first
    if (currentPov.altitude < 0.3) {
      // First zoom out slightly
      globeEl.current.pointOfView({
        ...currentPov,
        altitude: 5
      }, 1000, () => {
        // Then navigate to new position
        globeEl.current.pointOfView({
          lat: lat,
          lng: lng,
          altitude: 1.5
        }, 2000);
      });
    } else {
      // Navigate directly if we're not too zoomed in
      globeEl.current.pointOfView({
        lat: lat,
        lng: lng,
        altitude: 1.5
      }, 2000);
    }
  };

  // Handle navigation when navigateToCoordinates prop changes
  useEffect(() => {
    if (navigateToCoordinates && globeReady) {
      goToCoordinates(navigateToCoordinates.lat, navigateToCoordinates.lng);
    }
  }, [navigateToCoordinates, globeReady]);

  // Fetch country data once and memoize
  useEffect(() => {
    // load data
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setCountries(data);
        
        // Create stable country polygons data
        if (data && data.features) {
          // Process countries once
          const processedPolygons = data.features.map(feature => ({
            ...feature,
            // Pre-calculate colors to keep them stable
            capColor: (() => {
              const intensity = Math.floor(140 + Math.random() * 115);
              const hex = intensity.toString(16).padStart(2, '0');
              return `#${hex}${hex}${hex}`;
            })()
          }));
          setCountryPolygons(processedPolygons);
        }
      })
      .catch(error => {
        console.error("Error loading GeoJSON:", error);
      });
  }, []);

  // Create starfield background only once when globe is ready
  useEffect(() => {
    if (globeReady && globeEl.current) {
      const scene = globeEl.current.scene();
      
      // Create stars
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({
        size: 8,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true
      });
      
      // Generate random stars
      const starCount = 2000;
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      
      for (let i = 0; i < starCount; i++) {
        // Generate random spherical coordinates
        const theta = Math.random() * Math.PI * 2; // Angle around y-axis
        const phi = Math.acos((Math.random() * 2) - 1); // Angle from y-axis
        const radius = 1000 + Math.random() * 5000; // Distance from center
        
        // Convert to Cartesian coordinates
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Random color between white and yellow
        const whiteness = Math.random();
        colors[i * 3] = 1; // Red always 1
        colors[i * 3 + 1] = 1; // Green always 1
        colors[i * 3 + 2] = whiteness * 0.5 + 0.5; // Blue varies from 0.5 to 1
      }
      
      starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const stars = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(stars);
      
      // Make stars move with the camera
      const originalUpdateCallback = globeEl.current.controls().addEventListener('change', () => {});
      globeEl.current.controls().removeEventListener('change', originalUpdateCallback);
      
      globeEl.current.controls().addEventListener('change', () => {
        // Keep stars centered on camera
        stars.position.copy(globeEl.current.camera().position);
      });
      
      return () => {
        scene.remove(stars);
      };
    }
  }, [globeReady]);

  // Ocean data memoized to avoid recreating on every render
  const oceans = useMemo(() => [
    // 🌊 Major Oceans
    { properties: { name: "Atlantic Ocean", latitude: 0, longitude: -30, isOcean: true } },
    { properties: { name: "Pacific Ocean", latitude: 0, longitude: -170, isOcean: true } },
    { properties: { name: "Indian Ocean", latitude: -20, longitude: 80, isOcean: true } },
    { properties: { name: "Southern Ocean", latitude: -60, longitude: 0, isOcean: true } },
    { properties: { name: "Arctic Ocean", latitude: 85, longitude: 0, isOcean: true } },
  
    // 🌊 Ocean Regions
    { properties: { name: "North Atlantic Ocean", latitude: 40, longitude: -40, isOcean: true } },
    { properties: { name: "South Atlantic Ocean", latitude: -30, longitude: -15, isOcean: true } },
    { properties: { name: "North Pacific Ocean", latitude: 30, longitude: 180, isOcean: true } },
    { properties: { name: "South Pacific Ocean", latitude: -30, longitude: -150, isOcean: true } },
  
    // 🌊 Major Seas - only showing a few to reduce clutter
    { properties: { name: "Mediterranean Sea", latitude: 35, longitude: 18, isOcean: true, smallOcean: true } },
    { properties: { name: "Caribbean Sea", latitude: 17, longitude: -73, isOcean: true, smallOcean: true } },
    { properties: { name: "South China Sea", latitude: 10, longitude: 115, isOcean: true, smallOcean: true } },
  ], []);

  // Continent data memoized to avoid recreating on every render
  const continents = useMemo(() => [
    { properties: { name: "AFRICA", latitude: 0, longitude: 20, isContinent: true } },
    { properties: { name: "EUROPE", latitude: 50, longitude: 10, isContinent: true } },
    { properties: { name: "ASIA", latitude: 45, longitude: 90, isContinent: true } },
    { properties: { name: "NORTH AMERICA", latitude: 40, longitude: -100, isContinent: true } },
    { properties: { name: "SOUTH AMERICA", latitude: -20, longitude: -60, isContinent: true } },
    { properties: { name: "AUSTRALIA", latitude: -25, longitude: 135, isContinent: true } },
    { properties: { name: "ANTARCTICA", latitude: -80, longitude: 0, isContinent: true } },
  ], []);

  // Configure event listeners for the camera during globe initialization
  // Configure event listeners for the camera during globe initialization
  useEffect(() => {
    if (globeReady && globeEl.current) {
      // Automatic rotation (slower for a more majestic feel)
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().enableZoom = true;
      globeEl.current.controls().enableRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.001; // Slower rotation
      globeEl.current.controls().zoomSpeed = 0.06; // Smoother zoom

      // Initial camera position - further away for a more distant view
      globeEl.current.pointOfView({
        lat: 10, // More centered view
        lng: 0,
        altitude: 4.0 // Further away from Earth
      });

      // Initialize camera distance
      const distance = globeEl.current.camera().position.length();
      setCameraDistance(distance);
      
      // Throttle camera change events to improve performance
      let lastUpdate = 0;
      const updateInterval = 200; // ms between updates

      // Add throttled listener for camera changes
      globeEl.current.controls().addEventListener('scroll', () => {
        const now = Date.now();
        if (now - lastUpdate > updateInterval) {
          const newDistance = globeEl.current.camera().position.length();
          setCameraDistance(newDistance);
          lastUpdate = now;
        }
      });
    }
  }, [globeReady]);

  // Format ocean data for the globe - memoized to avoid recreating on every render
  const formattedOceans = useMemo(() => oceans.map(ocean => ({
    lat: ocean.properties.latitude,
    lng: ocean.properties.longitude,
    name: ocean.properties.name,
    size: getDynamicLabelSize(1.2, false, true, ocean.properties.smallOcean),
    color: 'rgba(100, 200, 255, 0.8)',
    isOcean: true,
    smallOcean: ocean.properties.smallOcean
  })), [oceans, zoomCategory]);

  // Format country data for labels - memoized to stabilize
  const countryLabels = useMemo(() => {
    if (!countries.features || countries.features.length === 0) return [];
    
    return countries.features
      .filter(country => country.properties && country.properties.ADMIN)
      .map(country => {
        // Calculate centroid (simplified)
        let lat = 0, lng = 0, count = 0;
        
        // For Polygon geometry
        if (country.geometry.type === 'Polygon' && country.geometry.coordinates[0]) {
          country.geometry.coordinates[0].forEach(coord => {
            lng += coord[0];
            lat += coord[1];
            count++;
          });
        } 
        // For MultiPolygon geometry
        else if (country.geometry.type === 'MultiPolygon' && country.geometry.coordinates[0]) {
          country.geometry.coordinates[0][0].forEach(coord => {
            lng += coord[0];
            lat += coord[1];
            count++;
          });
        }
        
        if (count > 0) {
          lat /= count;
          lng /= count;
        }
        
        return {
          lat: lat,
          lng: lng,
          name: country.properties.ADMIN,
          size: getDynamicLabelSize(0.8, true, false),
          color: 'rgba(255, 255, 255, 0.8)',
          isCountry: true
        };
      });
  }, [countries.features, zoomCategory]);

  // Formatter to make news event data compatible with Globe format - this changes with newsEvents
  const formattedNewsEvents = useMemo(() => {
    return newsEvents
      .filter(event => {
        // Filter out items with invalid coordinates
        return typeof event.latitude === 'number' && !isNaN(event.latitude) && 
               typeof event.longitude === 'number' && !isNaN(event.longitude);
      })
      .map(event => ({
        lat: event.latitude,
        lng: event.longitude,
        size: getDynamicLabelSize(0.8),
        color: getThemeColor(event.theme),
        title: event.title,
        location: event.location,
        isNews: true,
        theme: event.theme
      }));
  }, [newsEvents, zoomCategory, getThemeColor]);

  // This function handles click on news points
  const handlePointClick = (point) => {
    console.log("Point clicked:", point);
    // Call the parent component's callback with the title
    if (onLabelClick && point.title) {
      onLabelClick(point.title);
    }
  };

  // This function handles click on country polygons
  const handleCountryClick = (polygon, event, { lat, lng }) => {
    if (!polygon.properties) return;
    
    const countryData = {
      name: polygon.properties.ADMIN,
      code: polygon.properties.ISO_A2,
      lat,
      lng
    };
    
    console.log("Country clicked:", countryData);
    
    // Navigate to the country
    goToCoordinates(lat, lng);
    
    // Call the parent component's callback with the country code
    if (onCountryClick) {
      onCountryClick(countryData);
    }
  };

  // Combine all label data (excluding news events) - memoized to avoid recreating on every render
  const allLabels = useMemo(() => [...formattedOceans, ...countryLabels], 
    [formattedOceans, countryLabels]);

  // Memoize country rendering properties
  const polygonSideColor = useMemo(() => () => '#505050', []);
  
  // Pre-computed stable colors for country polygons
  const polygonCapColorFn = useMemo(() => 
    (feature) => feature.capColor || '#AAAAAA', 
  []);

  return (
    <div className="globe-container">
      <Globe
        ref={globeEl}
        globeMaterial={globeMaterial}
        
        // Lighting
        ambientLightColor="white"
        ambientLightIntensity={20}
        directionalLightColor="white"
        directionalLightIntensity={100}
        directionalLightPosition={{ x: 10, y: 10, z: 0 }}
        showGraticules={true}
  
        // Countries - using the stable, pre-processed data
        polygonsData={countryPolygons}
        polygonResolution={3}
        polygonMargin={0.02}
        polygonUseDots={true}
        polygonAltitude={0.014}
        polygonSideColor={polygonSideColor}
        polygonCapColor={polygonCapColorFn}
        onPolygonClick={handleCountryClick} // Added country click handler
        polygonLabel={({ properties: d }) => (
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.7)', 
            color: 'white', 
            padding: '6px', 
            borderRadius: '3px',
            fontSize: '12px'
          }}>
            <div><b>{d.ADMIN}</b> ({d.ISO_A2})</div>
            <div>Population: {d.POP_EST.toLocaleString()}</div>
            <div style={{ 
              fontSize: '10px', 
              fontStyle: 'italic', 
              marginTop: '4px',
              color: '#4fc3f7' 
            }}>Click to filter news</div>
          </div>
        )}
        
        // Points for news events - these will update when newsEvents changes
        pointsData={formattedNewsEvents}
        pointColor={point => point.color}
        pointAltitude={0.03}
        pointRadius={0.7}
        pointResolution={20}
        onPointClick={handlePointClick}
        pointsMerge={false}
        
        // Labels for locations (only oceans and countries, not news)
        labelsData={allLabels}
        labelLat="lat"
        labelLng="lng"
        labelText={d => d.isCountry ? d.name : (d.isOcean ? d.name : "")}
        labelSize={d => d.isCountry ? getDynamicLabelSize(0.7, true, false) : 
                       (d.isOcean ? getDynamicLabelSize(1.2, false, true, d.smallOcean) : 0)}
        labelDotRadius={0}
        labelColor={d => d.isOcean ? 'rgba(100, 200, 255, 0.8)' : 
                        (d.isCountry ? 'rgba(30, 30, 30, 0.9)' : 'white')}
        labelResolution={2}
        labelAltitude={d => d.isOcean ? 0.03 : (d.isCountry ? 0.02 : 0.015)}
        labelIncludeDot={false}
        
        onGlobeReady={() => setGlobeReady(true)}
      />
    </div>
  );
};

export default GlobeDynamic;