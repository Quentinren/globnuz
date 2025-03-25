import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import './GlobeDynamic.css';

const GlobeDynamic = ({ newsEvents }) => {
  const globeEl = useRef();
  const [globeReady, setGlobeReady] = useState(false);
  const [cameraDistance, setCameraDistance] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const labelSize = 1;

  const [countries, setCountries] = useState({ features: []});

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
        size: 1,
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
        const radius = 1000 + Math.random() * 500; // Distance from center
        
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
        
        // Random size between 0.5 and 2.5
        sizes[i] = 0.5 + Math.random() * 1000;
      }
      
      starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
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

  // Ocean data with coordinates
  const oceans = [
    { properties: { name: "Atlantic Ocean", latitude: 0, longitude: -30, isOcean: true } },
    { properties: { name: "Pacific Ocean", latitude: 0, longitude: -170, isOcean: true } },
    { properties: { name: "Indian Ocean", latitude: -20, longitude: 80, isOcean: true } },
    { properties: { name: "Southern Ocean", latitude: -60, longitude: 0, isOcean: true } },
    { properties: { name: "Arctic Ocean", latitude: 85, longitude: 0, isOcean: true } },
    // Additional ocean regions
    { properties: { name: "North Atlantic", latitude: 40, longitude: -40, isOcean: true } },
    { properties: { name: "South Atlantic", latitude: -30, longitude: -15, isOcean: true } },
    { properties: { name: "North Pacific", latitude: 30, longitude: 180, isOcean: true } },
    { properties: { name: "South Pacific", latitude: -30, longitude: -150, isOcean: true } },
    { properties: { name: "Caribbean Sea", latitude: 17, longitude: -73, isOcean: true } },
    { properties: { name: "Mediterranean Sea", latitude: 35, longitude: 18, isOcean: true } }
  ];

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
      globeEl.current.controls().autoRotateSpeed = 0.07;
      
      // Initial camera position
      globeEl.current.pointOfView({
        lat: 30, 
        lng: 10,
        altitude: 2.5
      });
      
      // Initialize camera distance
      const distance = globeEl.current.camera().position.length();
      setCameraDistance(distance);
      updateZoomLevel(distance);

      // Add listener for camera changes
      globeEl.current.controls().addEventListener('move', () => {
        const newDistance = globeEl.current.camera().position.length();
        setCameraDistance(newDistance);
        updateZoomLevel(newDistance);
      });
    }
  }, [globeReady]);

  // Function to determine zoom level based on camera distance
  const updateZoomLevel = (distance) => {
    // These thresholds can be adjusted as needed
    if (distance < 100) {
      if(zoomLevel !== 4) setZoomLevel(4); // Very zoomed in
    } else if (distance < 350) {
      if(zoomLevel !== 3) setZoomLevel(3); // Medium zoom
    } 
    else if (distance < 700) {
      if(zoomLevel !== 2) setZoomLevel(2); // Medium zoom
    } else {
      if(zoomLevel !== 1) setZoomLevel(1); // Far view
    }
  };

  // Calculate label size based on zoom level
  const getLabelSize = (d) => {
    const baseSize = 1;
    
    switch (zoomLevel) {
      case 4: 
        return baseSize * 0.2; // Smaller when very zoomed in (many visible labels)
      case 3: 
        return baseSize * 0.4; // Smaller when zoomed in (many visible labels)
      case 2:
        return baseSize * 0.7; // Larger at medium zoom
      default:
        return baseSize; // Default size for far zoom
    }
  };
  
  // Determine label color
  const getLabelColor = (d) => {
      return 'rgba(255, 255, 255, 1)'; // White for other places
  };

  // Formatter pour rendre les données d'actualités compatibles avec le format attendu par Globe
  const formattedNewsEvents = newsEvents.map(event => ({
    lat: event.lat,
    lng: event.lng,
    size: 0.8,
    color: 'red',
    title: event.title,
    location: event.newspaper
  }));

  return (
    <div className="globe-container">
      <Globe
        ref={globeEl}
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg"
        
        hexPolygonsData={countries.features}
        hexPolygonResolution={3}
        hexPolygonMargin={0.3}
        hexPolygonUseDots={true}
        hexPolygonColor={() => {
          // Générer un nombre aléatoire entre 128 (50% de blanc) et 255 (100% de blanc)
          const intensity = Math.floor(128 + Math.random() * 128);
          // Convertir en hexadécimal et créer une couleur avec la même valeur pour R, G et B
          const hex = intensity.toString(16).padStart(2, '0');
          return `#${hex}${hex}${hex}`;
        }}
        hexPolygonLabel={({ properties: d }) => <div>
          <div><b>{d.ADMIN} ({d.ISO_A2})</b></div>
          <div>Population: <i>{d.POP_EST}</i></div>
        </div>}
        
        // Points for news events
        pointsData={formattedNewsEvents}
        pointLabel={d => `<div class="globe-label">${d.title}<br/>${d.location}</div>`}
        pointRadius={0.2}
        pointColor="point => 'rgba(255, 0, 0, 1)'"
        pointAltitude={0.01}
        pointsMerge={false}
        
        // Radial lines from center to news events
        ringsData={formattedNewsEvents}
        ringColor={() => 'rgba(255, 0, 0, 0.7)'}
        ringMaxRadius={4}
        
        
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
        
        // Labels for locations
        labelsData={formattedNewsEvents}
        labelLat="lat"
        labelLng="lng"
        labelText="title"
        labelSize={1}
        labelDotRadius={0.5}
        labelColor={() => '	rgb(127, 0, 255)'}
        labelResolution={2}
        labelAltitude={0.02}
        
        showGraticules={true}
        showAtmosphere={true}
        atmosphereColor="rgba(65, 116, 197, 0.3)" // Light blue atmosphere
        
        onGlobeReady={() => setGlobeReady(true)}
      />
    </div>
  );
};

export default GlobeDynamic;