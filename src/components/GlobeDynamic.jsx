import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import './GlobeDynamic.css';

const GlobeDynamic = ({ newsEvents, navigateToCoordinates }) => {
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

  // Function to navigate to coordinates
  const goToCoordinates = (lat, lng) => {
    if (globeEl.current) {
      // Animate to the target coordinates
      globeEl.current.pointOfView({
        lat: lat,
        lng: lng,
        altitude: 2 // Control how close the view gets
      }, 1000); // 1000ms animation duration
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
        console.log("GeoJSON data loaded:", data);
        console.log("Number of features:", data.features.length);
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

      // Create stars
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({
        size: 5,
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
        
        sizes[i] = 3 + Math.random() * 15;
      }
      
      starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 3));
      
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

  // Formatter pour rendre les données d'actualités compatibles avec le format attendu par Globe
  const formattedNewsEvents = newsEvents.map(event => ({
    lat: event.lat,
    lng: event.lng,
    size: getDynamicLabelSize(0.8),
    color: 'red',
    isNews: true,
    title: event.title,
    location: event.newspaper,
    isNews: true
  }));

  // Combine all label data
  const allLabels = [...formattedNewsEvents, ...formattedOceans, ...countryLabels];

  return (
    <div className="globe-container">
      <Globe
        ref={globeEl}
        globeMaterial={globeMaterial}

        polygonsData={countries.features}
        polygonResolution={3}
        polygonMargin={0.02}
        polygonUseDots={true}
        polygonAltitude={0.0063}
        polygonSideColor={() => '#505050'}
        polygonCapColor={() => {
          // Générer un nombre aléatoire entre 128 (50% de blanc) et 255 (100% de blanc)
          const intensity = Math.floor(128 + Math.random() * 126);
          // Convertir en hexadécimal et créer une couleur avec la même valeur pour R, G et B
          const hex = intensity.toString(16).padStart(2, '0');
          return `#${hex}${hex}${hex}`;
        }}
        polygonLabel={({ properties: d }) => <div>
          <div><b>{d.ADMIN} ({d.ISO_A2})</b></div>
          <div>Population: <i>{d.POP_EST}</i></div>
        </div>}
        
        // Points for news events
        pointsData={formattedNewsEvents}
        pointRadius={0.08}
        pointColor="point => 'rgba(230, 30, 10, 1)'"
        pointAltitude={0.001}
        pointsMerge={false}
        
        // Radial lines from center to news events
        ringsData={formattedNewsEvents}
        ringPropagationSpeed={0.2}
        ringRepeatPeriod={500}
        ringColor={() => 'rgba(255, 0, 0, 0.7)'}
        ringMaxRadius={1}
        ringAltitude={0.01}
        
        // Custom three.js rendering for lines
        customLayerData={formattedNewsEvents}
        customThreeObject={d => {
          // Créer une ligne qui va du centre à la surface du globe (et légèrement au-delà)
          const startVec = new THREE.Vector3(0, 0, 0); // Centre du globe
          
          // Calculer le point sur la surface du globe
          const lat = d.lat * Math.PI / 180;
          const lng = d.lng * Math.PI / 180;
          const r = 1.05; // Rayon légèrement supérieur à 1 pour dépasser
          
          const endVec = new THREE.Vector3(
            r * Math.cos(lat) * Math.sin(lng),
            r * Math.sin(lat),
            r * Math.cos(lat) * Math.cos(lng)
          );
          
          // Créer la géométrie pour la ligne
          const geometry = new THREE.BufferGeometry().setFromPoints([startVec, endVec]);
          
          // Matériau rouge pour la ligne
          const material = new THREE.LineBasicMaterial({ color: 'red', linewidth: 2 });
          
          // Créer la ligne
          return new THREE.Line(geometry, material);
        }}
        customThreeObjectUpdate={(obj, d) => {
          // Mettre à jour si nécessaire
        }}
        
        // Labels for locations (all combined)
        labelsData={allLabels}
        labelLat="lat"
        labelLng="lng"
        labelText={d => d.isCountry ? d.name : (d.isOcean ? d.name : d.title)}
        labelSize={d => d.isCountry ? getDynamicLabelSize(0.7, true, false) : 
                       (d.isOcean ? getDynamicLabelSize(1.2, false, true, d.smallOcean) : 
                                   getDynamicLabelSize(0.4))}
        labelDotRadius={0.5}
        labelColor={d => d.isOcean ? 'rgba(100, 200, 255, 0.8)' : 
                        (d.isCountry ? 'rgba(30, 30, 30, 0.9)' : 
                        (d.isNews ? 'rgba(240, 30, 30, 0.9)' : 'white'))}
        labelResolution={2}
        labelAltitude={d => d.isOcean ? 0.03 : (d.isCountry ? 0.01 : 0.02)}
        labelIncludeDot={d => !d.isOcean && !d.isCountry}
        
        onGlobeReady={() => setGlobeReady(true)}
      />
    </div>
  );
};

export default GlobeDynamic;