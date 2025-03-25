// services/mapDataService.js

/**
 * Service for retrieving geographic data for the globe visualization
 */

// Fetch countries data (borders)
export const fetchCountriesData = async () => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson');
      const data = await response.json();
      return data.features;
    } catch (error) {
      console.error('Error fetching countries data:', error);
      return [];
    }
  };
  
  // Fetch places data (populated places)
  export const fetchPlacesData = async () => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_populated_places_simple.geojson');
      const data = await response.json();
      return data.features;
    } catch (error) {
      console.error('Error fetching places data:', error);
      return [];
    }
  };
  // You can add more geographic data retrieval functions here as needed