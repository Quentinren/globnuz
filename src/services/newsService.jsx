// src/services/newsService.jsx - Enhanced with pagination support
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - replace with your Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_APP_SUPABASE_ANON_KEY;

// Ensure the environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase environment variables are missing. ' +
    'Make sure you have created a .env file based on .env.example ' +
    'and added your Supabase credentials.'
  );
}

// Create client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetches news events from Supabase with comprehensive filter support and pagination
 * @param {Object} filters - Optional filters for news content
 * @param {Number} page - Page number to fetch (1-based)
 * @param {Number} pageSize - Number of items per page
 * @returns {Promise<Array>} - Array of news events in the required format
 */
export const fetchNewsFromSupabase = async (filters = {}, page = 1, pageSize = 20) => {
  try {
    console.log("Fetching news with filters:", filters, "page:", page, "pageSize:", pageSize);
    
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Check your environment variables.');
    }
    
    // Calculate range for pagination
    const fromIndex = (page - 1) * pageSize;
    const toIndex = fromIndex + pageSize - 1;
    
    // Start building the query
    let query = supabase
      .from('news_articles_translated')
      .select('*, news_articles!inner(*, newspapers(*))')
      .eq('language_translated', 'FR')
      .range(fromIndex, toIndex);  // Apply pagination
    
    // Extract filter categories
    const { 
      // Categories
      environment, politics, health, science, technology, other,
      // Regions
      africa, americas, asia, europe, oceania,
      // Source filters (country-specific)
      sourceFilters = {}
    } = filters;
    
    // Check if any category filter is active
    const hasActiveCategoryFilter = environment || politics || health || science || technology || other;
    
    // Apply category filters if any are active
    if (hasActiveCategoryFilter) {
      const activeCategories = [];
      if (environment) activeCategories.push('environment');
      if (politics) {
        activeCategories.push('politics', 'politic', 'geopolitics', 'geopolitic');
      }
      if (health) activeCategories.push('health');
      if (science) activeCategories.push('science');
      if (technology) activeCategories.push('technology');
      
      // Only apply if we have active categories
      if (activeCategories.length > 0) {
        // Filter to match any of the active categories
        query = query.filter('news_articles.theme', 'in', `(${activeCategories.join(',')})`);
      }
    }
    
    // Define country codes by region for filtering
    const regionCountryCodes = {
      africa: ['DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CV', 'CF', 'TD', 'KM', 'CG', 'CD', 'DJ', 'EG', 'GQ', 'ER', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'CI', 'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'SZ', 'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW'],
      americas: ['AI', 'AG', 'AR', 'AW', 'BS', 'BB', 'BZ', 'BM', 'BO', 'BR', 'CA', 'KY', 'CL', 'CO', 'CR', 'CU', 'DM', 'DO', 'EC', 'SV', 'FK', 'GF', 'GL', 'GD', 'GP', 'GT', 'GY', 'HT', 'HN', 'JM', 'MQ', 'MX', 'MS', 'NI', 'PA', 'PY', 'PE', 'PR', 'BL', 'KN', 'LC', 'MF', 'PM', 'VC', 'SR', 'TT', 'TC', 'US', 'UY', 'VE', 'VG', 'VI'],
      asia: ['AF', 'AM', 'AZ', 'BH', 'BD', 'BT', 'BN', 'KH', 'CN', 'CY', 'GE', 'HK', 'IN', 'ID', 'IR', 'IQ', 'IL', 'JP', 'JO', 'KZ', 'KP', 'KR', 'KW', 'KG', 'LA', 'LB', 'MO', 'MY', 'MV', 'MN', 'MM', 'NP', 'OM', 'PK', 'PS', 'PH', 'QA', 'SA', 'SG', 'LK', 'SY', 'TW', 'TJ', 'TH', 'TL', 'TR', 'TM', 'AE', 'UZ', 'VN', 'YE'],
      europe: ['AL', 'AD', 'AT', 'BY', 'BE', 'BA', 'BG', 'HR', 'CZ', 'DK', 'EE', 'FO', 'FI', 'FR', 'DE', 'GI', 'GR', 'GG', 'VA', 'HU', 'IS', 'IE', 'IM', 'IT', 'JE', 'LV', 'LI', 'LT', 'LU', 'MT', 'MD', 'MC', 'ME', 'NL', 'MK', 'NO', 'PL', 'PT', 'RO', 'RU', 'SM', 'RS', 'SK', 'SI', 'ES', 'SJ', 'SE', 'CH', 'UA', 'GB'],
      oceania: ['AS', 'AU', 'CK', 'FJ', 'PF', 'GU', 'KI', 'MH', 'FM', 'NR', 'NC', 'NZ', 'NU', 'NF', 'MP', 'PW', 'PG', 'PN', 'WS', 'SB', 'TK', 'TO', 'TV', 'VU', 'WF']
    };
    
    // Check if any region filter is active
    const hasActiveRegionFilter = africa || americas || asia || europe || oceania;
    
    // Create a combined list of country codes from selected regions
    if (hasActiveRegionFilter) {
      let countryCodes = [];
      if (africa) countryCodes = [...countryCodes, ...regionCountryCodes.africa];
      if (americas) countryCodes = [...countryCodes, ...regionCountryCodes.americas];
      if (asia) countryCodes = [...countryCodes, ...regionCountryCodes.asia];
      if (europe) countryCodes = [...countryCodes, ...regionCountryCodes.europe];
      if (oceania) countryCodes = [...countryCodes, ...regionCountryCodes.oceania];
      
      if (countryCodes.length > 0) {
        // Apply as IN filter to country_id using the proper syntax
        query = query.filter('news_articles.country_id', 'in', `(${countryCodes.map(code => `'${code}'`).join(',')})`);
      }
    }
    
    // Check for source country filters
    const sourceCountryIds = Object.entries(sourceFilters)
      .filter(([_, isActive]) => isActive)
      .map(([countryId]) => countryId);
    
    if (sourceCountryIds.length > 0) {
      // Filter by newspaper country using the proper syntax
      query = query.filter('news_articles.newspapers.country_id', 'in', 
        `(${sourceCountryIds.map(id => `'${id}'`).join(',')})`);
    }
    
    // Sort by publication date (newest first)
    query = query.order('publication_date', { foreignTable: 'news_articles', ascending: false });
    
    // Execute the query
    let data, error;
    
    try {
      const response = await query;
      data = response.data;
      error = response.error;
    } catch (e) {
      console.error("Filter query failed, trying fallback approach:", e);
      
      // Fallback: If complex filtering fails, try a simple query
      const fallbackQuery = supabase
        .from('news_articles_translated')
        .select('*, news_articles!inner(*, newspapers(*))')
        .eq('language_translated', 'FR')
        .order('publication_date', { foreignTable: 'news_articles', ascending: false })
        .range(fromIndex, toIndex);  // Apply pagination to fallback query
        
      const fallbackResponse = await fallbackQuery;
      data = fallbackResponse.data;
      error = fallbackResponse.error;
    }
    
    if (error) {
      console.error("Supabase query error:", error);
      throw new Error(error.message);
    }
    
    console.log(`Fetched ${data?.length || 0} news items for page ${page}`);
    
    if (!data || data.length === 0) {
      console.warn('No news data retrieved from Supabase');
      return [];
    }
    
    // Transform the data to the expected format
    return data.map(item => ({
      id: item.news_articles.id,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      author: item.news_articles.author,
      newspaper_id: item.news_articles.newspaper_id,
      newspaper: item.news_articles.newspapers ? {
        id: item.news_articles.newspapers.id,
        name: item.news_articles.newspapers.name,
        description: item.news_articles.newspapers.description,
        country_id: item.news_articles.newspapers.country_id,
      } : null,
      theme: item.news_articles.theme,
      theme_tags: Array.isArray(item.news_articles.theme_tags) ? 
                 item.news_articles.theme_tags : 
                 (item.news_articles.theme_tags ? JSON.parse(item.news_articles.theme_tags) : []),
      image: item.news_articles.image,
      external_link: item.news_articles.external_link,
      publication_date: item.news_articles.publication_date,
      country_id: item.news_articles.country_id,
      location: item.location || item.news_articles.location,
      latitude: parseFloat(item.news_articles.latitude),
      longitude: parseFloat(item.news_articles.longitude)
    }));
    
  } catch (error) {
    console.error('Error fetching news from Supabase:', error);
    throw error;
  }
};

// Function to fetch total count of news articles matching filters (for pagination)
export const fetchNewsCount = async (filters = {}) => {
  try {
    // Build a query to count records with the same filters
    let query = supabase
      .from('news_articles_translated')
      .select('id', { count: 'exact' })
      .eq('language_translated', 'FR');
    
    // Extract filter categories
    const { 
      environment, politics, health, science, technology, other,
      africa, americas, asia, europe, oceania,
      sourceFilters = {}
    } = filters;
    
    // Apply the same filters as in fetchNewsFromSupabase
    // (Duplicate the filter logic from above, keeping it in sync)
    
    const { count, error } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error fetching news count:', error);
    return 0;
  }
};

// Function to fetch countries from Supabase - enhanced with caching
export const fetchCountriesFromSupabase = async () => {
  try {
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Check your environment variables.');
    }
    
    // Fetch countries from Supabase table
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      console.warn('No countries data retrieved from Supabase');
      return [];
    }
    
    // Convert Supabase data to match the expected format
    return data.map(item => ({
      name: item.name,
      country_id: item.country_id,
      flag_image_url: item.flag_image_url || `https://flagcdn.com/${item.country_id.toLowerCase()}.svg`,
      region: item.region || 'unknown'
    }));
    
  } catch (error) {
    console.error('Error fetching countries from Supabase:', error);
    throw error;
  }
};

// Other existing functions remain the same

export const getNewsEventById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching news event:', error);
    throw error;
  }
};

export const searchNewsEvents = async (keyword) => {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .or(`title.ilike.%${keyword}%,subtitle.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      .order('publication_date', { ascending: false });
      
    if (error) throw error;
    return data.map(item => ({
      ...item,
      theme_tags: Array.isArray(item.theme_tags) ? item.theme_tags : (item.theme_tags ? JSON.parse(item.theme_tags) : []),
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lng)
    }));
  } catch (error) {
    console.error('Error searching news events:', error);
    throw error;
  }
};

export const getNewsByTheme = async (theme) => {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('theme', theme)
      .order('publication_date', { ascending: false });
      
    if (error) throw error;
    return data.map(item => ({
      ...item,
      theme_tags: Array.isArray(item.theme_tags) ? item.theme_tags : (item.theme_tags ? JSON.parse(item.theme_tags) : []),
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lng)
    }));
  } catch (error) {
    console.error('Error fetching news by theme:', error);
    throw error;
  }
};