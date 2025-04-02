// src/services/newsService.jsx - Updated with filter support
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
 * Fetches news events from Supabase with optional filters
 * @param {Object} filters - Optional filters for news content
 * @returns {Promise<Array>} - Array of news events in the required format
 */
export const fetchNewsFromSupabase = async (filters = {}) => {
  try {
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Check your environment variables.');
    }
    
    // Start building the query
    let query = supabase
      .from('news_articles_translated')
      .select('*, news_articles!inner(*, newspapers(*))')
      .eq('language_translated', 'FR');
    
    // Parse filters
    const { 
      // Categories
      environment, politics, health, science, technology, other,
      // Regions
      africa, americas, asia, europe, oceania
    } = filters;
    
    // Apply category filters if any are active
    const activeCategories = [];
    if (environment) activeCategories.push('environment');
    if (politics) activeCategories.push('politics', 'politic', 'geopolitics', 'geopolitic');
    if (health) activeCategories.push('health');
    if (science) activeCategories.push('science');
    if (technology) activeCategories.push('technology');
    
    // Apply category filter if there are active categories
    if (activeCategories.length > 0) {
      query = query.filter('news_articles.theme', 'in', `(${activeCategories.join(',')})`);
    }
    
    // If "other" is selected, we need a more complex query to get themes NOT in the main categories
    if (other) {
      // We need to handle this differently - may require multiple queries or a complex filter
      console.log('Other category filter not yet implemented in API');
    }
    
    // Apply region filters if any are active
    const activeRegions = [];
    if (africa) activeRegions.push('africa');
    if (americas) activeRegions.push('americas');
    if (asia) activeRegions.push('asia');
    if (europe) activeRegions.push('europe');
    if (oceania) activeRegions.push('oceania');
    
    // Define country codes by region for filtering
    const regionCountryCodes = {
      africa: ['DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CV', 'CF', 'TD', 'KM', 'CG', 'CD', 'DJ', 'EG', 'GQ', 'ER', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'CI', 'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'SZ', 'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW'],
      americas: ['AI', 'AG', 'AR', 'AW', 'BS', 'BB', 'BZ', 'BM', 'BO', 'BR', 'CA', 'KY', 'CL', 'CO', 'CR', 'CU', 'DM', 'DO', 'EC', 'SV', 'FK', 'GF', 'GL', 'GD', 'GP', 'GT', 'GY', 'HT', 'HN', 'JM', 'MQ', 'MX', 'MS', 'NI', 'PA', 'PY', 'PE', 'PR', 'BL', 'KN', 'LC', 'MF', 'PM', 'VC', 'SR', 'TT', 'TC', 'US', 'UY', 'VE', 'VG', 'VI'],
      asia: ['AF', 'AM', 'AZ', 'BH', 'BD', 'BT', 'BN', 'KH', 'CN', 'CY', 'GE', 'HK', 'IN', 'ID', 'IR', 'IQ', 'IL', 'JP', 'JO', 'KZ', 'KP', 'KR', 'KW', 'KG', 'LA', 'LB', 'MO', 'MY', 'MV', 'MN', 'MM', 'NP', 'OM', 'PK', 'PS', 'PH', 'QA', 'SA', 'SG', 'LK', 'SY', 'TW', 'TJ', 'TH', 'TL', 'TR', 'TM', 'AE', 'UZ', 'VN', 'YE'],
      europe: ['AL', 'AD', 'AT', 'BY', 'BE', 'BA', 'BG', 'HR', 'CZ', 'DK', 'EE', 'FO', 'FI', 'FR', 'DE', 'GI', 'GR', 'GG', 'VA', 'HU', 'IS', 'IE', 'IM', 'IT', 'JE', 'LV', 'LI', 'LT', 'LU', 'MT', 'MD', 'MC', 'ME', 'NL', 'MK', 'NO', 'PL', 'PT', 'RO', 'RU', 'SM', 'RS', 'SK', 'SI', 'ES', 'SJ', 'SE', 'CH', 'UA', 'GB'],
      oceania: ['AS', 'AU', 'CK', 'FJ', 'PF', 'GU', 'KI', 'MH', 'FM', 'NR', 'NC', 'NZ', 'NU', 'NF', 'MP', 'PW', 'PG', 'PN', 'WS', 'SB', 'TK', 'TO', 'TV', 'VU', 'WF']
    };
    
    // Create a combined list of country codes from selected regions
    if (activeRegions.length > 0) {
      const countryCodes = activeRegions.flatMap(region => regionCountryCodes[region] || []);
      if (countryCodes.length > 0) {
        query = query.filter('news_articles.country_id', 'in', `(${countryCodes.join(',')})`);
      }
    }
    
    // Sort by publication date (newest first)
    query = query.order('publication_date', { foreignTable: 'news_articles', ascending: false });
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      console.warn('No news data retrieved from Supabase');
      return [];
    }
    
    // Transform the data
    return data.map(item => ({
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      author: item.news_articles.author,
      newspaper: item.news_articles.newspapers ? {
        id: item.news_articles.newspapers.id,
        name: item.news_articles.newspapers.name,
        description: item.news_articles.newspapers.description,
        country_id: item.news_articles.newspapers.country_id,
      } : null,
      theme: item.news_articles.theme,
      theme_tags: Array.isArray(item.news_articles.theme_tags) ? item.news_articles.theme_tags : (item.news_articles.theme_tags ? JSON.parse(item.news_articles.theme_tags) : []),
      image: item.news_articles.image,
      external_link: item.news_articles.external_link,
      publication_date: item.news_articles.publication_date,
      country_id: item.news_articles.country_id,
      location: item.location,
      latitude: parseFloat(item.news_articles.latitude),
      longitude: parseFloat(item.news_articles.longitude)
    }));
    
  } catch (error) {
    console.error('Error fetching news from Supabase:', error);
    throw error;
  }
};

// Other existing functions
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

export const fetchCountriesFromSupabase = async () => {
  try {
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Check your environment variables.');
    }
    
    // Fetch news from Supabase table - adjust table name as needed
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('country_id', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      console.warn('No countries data retrieved from Supabase');
      return [];
    }
    
    // Convert Supabase data to match the existing format
    return data.map(item => ({
      name: item.name,
      country_id: item.country_id,
      flag_image_url: item.flag_image_url,
    }));
    
  } catch (error) {
    console.error('Error fetching countries from Supabase:', error);
    throw error;
  }
};