import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import './GlobeDynamic.css';
import '../components/css/news-themes.css'; // Import the theme colors CSS

const GlobeDynamic = ({ newsEvents, navigateToCoordinates, onLabelClick }) => {
  const globeEl = useRef();
  const [globeReady, setGlobeReady] = useState(false);
  const [cameraDistance, setCameraDistance] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const labelSize = 1;

  const [countries, setCountries] = useState({ features: []});

  // Define discrete zoom levels instead of continuous calculations
  const [zoomCategory, setZoomCategory] = useState('medium'); // 'far', 'medium', 'close'
  
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

  // Get CSS variable for a given theme
  const getThemeColor = (theme) => {
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
  };

  // Enhanced goToCoordinates function with smoother transition
  const goToCoordinates = (lat, lng) => {
    if (!globeEl.current) return;
    console.log("latitude:", lat, "longitude:", lng);
    // First get current position
    const currentPov = globeEl.current.pointOfView();
    
    // If we're already zoomed in very close, zoom out a bit first
    if (currentPov.altitude < 0.3) {
      // First zoom out slightly
      globeEl.current.pointOfView({
        ...currentPov,
        altitude: 1.0
      }, 500, () => {
        // Then navigate to new position
        globeEl.current.pointOfView({
          lat: lat,
          lng: lng,
          altitude: 0.5
        }, 1000);
      });
    } else {
      // Navigate directly if we're not too zoomed in
      globeEl.current.pointOfView({
        lat: lat,
        lng: lng,
        altitude: 0.5
      }, 1000);
    }
  };

  // Appearance of the Earth
  const globeMaterial = new THREE.MeshPhongMaterial();
  globeMaterial.color = new THREE.Color('#003366');
  globeMaterial.background = new THREE.Color('#003366');
  globeMaterial.emissiveIntensity = 10;
  globeMaterial.showGraticules = true;
  globeMaterial.showAtmosphere = true;
  globeMaterial.atmosphereColor="rgba(65, 116, 197, 1)" ;// Light blue atmosphere

  // Handle navigation when navigateToCoordinates prop changes
  useEffect(() => {
    if (navigateToCoordinates && globeReady) {
      goToCoordinates(navigateToCoordinates.lat, navigateToCoordinates.lng);
    }
  }, [navigateToCoordinates, globeReady]);

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
      })
      .catch(error => {
        console.error("Error loading GeoJSON:", error);
      });
  }, []);

  // Create starfield background
  useEffect(() => {
    if (globeReady && globeEl.current) {
      const scene = globeEl.current.scene();
      
      //
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
      const sizes = new Float32Array(starCount);
      
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

  const oceans = [
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
  
    // 🌊 Major Seas
    { properties: { name: "Caribbean Sea", latitude: 17, longitude: -73, isOcean: true, smallOcean: true } },
    { properties: { name: "Mediterranean Sea", latitude: 35, longitude: 18, isOcean: true, smallOcean: true } },
    { properties: { name: "Baltic Sea", latitude: 56, longitude: 20, isOcean: true, smallOcean: true } },
    { properties: { name: "Black Sea", latitude: 44, longitude: 35, isOcean: true, smallOcean: true } },
    { properties: { name: "Red Sea", latitude: 20, longitude: 38, isOcean: true, smallOcean: true } },
    { properties: { name: "Arabian Sea", latitude: 15, longitude: 65, isOcean: true, smallOcean: true } },
    { properties: { name: "South China Sea", latitude: 10, longitude: 115, isOcean: true, smallOcean: true } },
    { properties: { name: "Bering Sea", latitude: 58, longitude: -175, isOcean: true, smallOcean: true } },
  
    // 🌊 Small but Important Seas
    { properties: { name: "Bay of Bengal", latitude: 12, longitude: 90, isOcean: true, smallOcean: true } },
    { properties: { name: "Gulf of Mexico", latitude: 25, longitude: -90, isOcean: true, smallOcean: true } },
    { properties: { name: "Andaman Sea", latitude: 10, longitude: 95, isOcean: true, smallOcean: true } },
    { properties: { name: "East China Sea", latitude: 27, longitude: 125, isOcean: true, smallOcean: true } },
    { properties: { name: "Yellow Sea", latitude: 37, longitude: 123, isOcean: true, smallOcean: true } },
    { properties: { name: "Caspian Sea", latitude: 41, longitude: 51, isOcean: true, smallOcean: true } },
    { properties: { name: "Aegean Sea", latitude: 38, longitude: 25, isOcean: true, smallOcean: true } },
    { properties: { name: "Adriatic Sea", latitude: 42, longitude: 15, isOcean: true, smallOcean: true } },
    { properties: { name: "Coral Sea", latitude: -18, longitude: 155, isOcean: true, smallOcean: true } },
    { properties: { name: "Tasman Sea", latitude: -40, longitude: 160, isOcean: true, smallOcean: true } },
    { properties: { name: "Labrador Sea", latitude: 55, longitude: -55, isOcean: true, smallOcean: true } },
    { properties: { name: "Norwegian Sea", latitude: 68, longitude: 5, isOcean: true, smallOcean: true } },
    { properties: { name: "Barents Sea", latitude: 75, longitude: 45, isOcean: true, smallOcean: true } }
  ];
  

  // Format ocean data for the globe
  const formattedOceans = oceans.map(ocean => ({
    lat: ocean.properties.latitude,
    lng: ocean.properties.longitude,
    name: ocean.properties.name,
    size: getDynamicLabelSize(1.2, false, true, ocean.properties.smallOcean),
    color: 'rgba(100, 200, 255, 0.8)',
    isOcean: true,
    smallOcean: ocean.properties.smallOcean
  }));

  // Format country data for labels
  const countryLabels = countries.features
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

  // Continent data with coordinates
  const continents = [
    { properties: { name: "AFRICA", latitude: 0, longitude: 20, isContinent: true } },
    { properties: { name: "EUROPE", latitude: 50, longitude: 10, isContinent: true } },
    { properties: { name: "ASIA", latitude: 45, longitude: 90, isContinent: true } },
    { properties: { name: "NORTH AMERICA", latitude: 40, longitude: -100, isContinent: true } },
    { properties: { name: "SOUTH AMERICA", latitude: -20, longitude: -60, isContinent: true } },
    { properties: { name: "AUSTRALIA", latitude: -25, longitude: 135, isContinent: true } },
    { properties: { name: "ANTARCTICA", latitude: -80, longitude: 0, isContinent: true } },
  ];

  // Configure event listeners for the camera during globe initialization
  useEffect(() => {
    if (globeReady && globeEl.current) {
      // Automatic rotation
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().enableZoom = true;
      globeEl.current.controls().enableRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.08;
      globeEl.current.controls().zoomSpeed = 0.8; // Slightly slower zoom for better performance
      // Increase quality of rendered (not shaky)

      // Initial camera position
      globeEl.current.pointOfView({
        lat: 50, 
        lng: 10,
        altitude: 2.5
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

  // Formatter to make news event data compatible with Globe format
  const formattedNewsEvents = newsEvents
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

  // This function handles the click on the label dot
  const handleLabelClick = (label) => {
    // Call the parent component's callback with the title
    if (onLabelClick && label.title) {
      onLabelClick(label.title);
    }
  };

  // Combine all label data
  const allLabels = [...formattedNewsEvents, ...formattedOceans, ...countryLabels, ...continents];

  return (
    <div className="globe-container">
      <Globe
        ref={globeEl}
        globeMaterial={globeMaterial}
        
        // Increase light intensity
        ambientLightColor="white"
        ambientLightIntensity={20} // Increased from 10

        // Increase directional light intensity
        directionalLightColor="white"
        directionalLightIntensity={100} // Increased from 2.5

        // Add a second directional light from another angle for more even lighting
        directionalLightPosition={{ x: 10, y: 10, z: 0 }}

        // Add graticules (longitude and latitude lines)
        showGraticules = {true}
  
        polygonsData={countries.features}
        polygonResolution={3}
        polygonMargin={0.02}
        polygonUseDots={true}
        polygonAltitude={0.014} //0.0063 good for distance middle
        polygonSideColor={() => '#505050'}
        polygonCapColor={() => {
          // Generate a random number between 128 (50% white) and 255 (100% white)
          const intensity = Math.floor(140 + Math.random() * 115);
          // Convert to hexadecimal and create a color with the same value for R, G, B
          const hex = intensity.toString(16).padStart(2, '0');
          return `#${hex}${hex}${hex}`;
        }}
        polygonLabel={({ properties: d }) => <div>
          <div><b>{d.ADMIN} ({d.ISO_A2})</b></div>
          <div>Population: <i>{d.POP_EST}</i></div>
        </div>}
        
        // Points for news events - now with dynamic theme colors
        pointsData={formattedNewsEvents}
        pointColor={point => point.color} // Use the theme color we set
        pointAltitude={0.015}
        pointsMerge={false}
        
        // Radial lines from center to news events - also themed
        ringsData={formattedNewsEvents}
        ringPropagationSpeed={0.2}
        ringRepeatPeriod={1000}
        ringColor={ring => {
          // Get the theme color but make it semi-transparent
          const color = ring.color || 'rgba(255, 0, 0, 0.7)';
          // If it's a hex color, convert to rgba with opacity
          if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, 0.7)`;
          }
          return color;
        }}
        ringMaxRadius={0.7}
        ringAltitude={0.015}
        
        // Custom three.js rendering for lines with theme colors
        customLayerData={formattedNewsEvents}
        customThreeObject={d => {
          // Validate coordinates first
          if (!d || typeof d.lat !== 'number' || isNaN(d.lat) || 
              typeof d.lng !== 'number' || isNaN(d.lng)) {
            // Return null or a tiny invisible object if coordinates are invalid
            return null;
          }
          
          // Create a line from the center to the surface of the globe (and slightly beyond)
          const startVec = new THREE.Vector3(0, 0, 0); // Center of globe
          
          // Calculate the point on the surface of the globe
          const lat = d.lat * Math.PI / 180;
          const lng = d.lng * Math.PI / 180;
          const r = 1.05; // Radius slightly greater than 1 to extend beyond
          
          const endVec = new THREE.Vector3(
            r * Math.cos(lat) * Math.sin(lng),
            r * Math.sin(lat),
            r * Math.cos(lat) * Math.cos(lng)
          );
          
          // Create the geometry for the line
          const geometry = new THREE.BufferGeometry().setFromPoints([startVec, endVec]);
          
          // Create material with the theme color
          let lineColor = d.color || 'red';
          const material = new THREE.LineBasicMaterial({ color: lineColor, linewidth: 2 });
          
          // Create the line
          return new THREE.Line(geometry, material);
        }}
        customThreeObjectUpdate={(obj, d) => {
          // Update if necessary - typically not needed for static lines
        }}
        
        // Labels for locations (all combined)
        labelsData={allLabels}
        labelLat="lat"
        labelLng="lng"
        labelText={d => d.isCountry ? d.name : (d.isOcean ? d.name : "")}
        labelSize={d => d.isCountry ? getDynamicLabelSize(0.7, true, false) : 
                       (d.isOcean ? getDynamicLabelSize(1.2, false, true, d.smallOcean) : 
                                   getDynamicLabelSize(0.4))}
        labelDotRadius={0.3}
        onLabelClick={handleLabelClick} // Add this handler
        labelColor={d => d.isOcean ? 'rgba(100, 200, 255, 0.8)' : 
                        (d.isCountry ? 'rgba(30, 30, 30, 0.9)' : 
                        (d.isNews ? d.color : 'white'))}
        labelResolution={2}
        labelAltitude={d => d.isOcean ? 0.03 : (d.isCountry ? 0.02 : 0.015)}
        labelIncludeDot={d => !d.isOcean && !d.isCountry}
        
        onGlobeReady={() => setGlobeReady(true)}
      />
    </div>
  );
};

export default GlobeDynamic;