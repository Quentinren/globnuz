// src/services/supabaseService.js
// Import Supabase client
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
 * Fetches news events from Supabase and formats them to match the application's data structure
 * @returns {Promise<Array>} - Array of news events in the required format
 */
// Updated mapping in fetchNewsFromSupabase function
export const fetchNewsFromSupabase = async () => {
    try {
      // Check if Supabase is properly configured
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured. Check your environment variables.');
      }
      
      // Fetch news from Supabase table - adjust table name as needed
      const { data, error } = await supabase
      .from('news_articles_translated')
      .select('*, news_articles!inner(*, newspapers(*))')
      .eq('language_translated', 'FR')
      .order('publication_date', { foreignTable: 'news_articles', ascending: false });
  
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data || data.length === 0) {
        console.warn('No news data retrieved from Supabase');
        return [];
      }
      
      console.log(data)
      // Convert Supabase data to match the existing format
      // Now including newspaper information
      return data.map(item => ({
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        author: item.news_articles.author,
        // Include newspaper details
        newspaper: item.news_articles.newspapers ? {
          id: item.news_articles.newspapers.id,
          name: item.news_articles.newspapers.name,
          description: item.news_articles.newspapers.description,
          country_id: item.news_articles.newspapers.country_id,
          // Include any other newspaper properties you need
        } : null,
        theme: item.news_articles.theme,
        theme_tags: Array.isArray(item.news_articles.theme_tags) ? item.news_articles.theme_tags : (item.news_articles.theme_tags ? JSON.parse(item.news_articles.theme_tags) : []),
        image: item.news_articles.image,
        external_link: item.news_articles.external_link,
        publication_date: item.news_articles.publication_date,
        country_id: item.news_articles.country_id,
        location: item.location,
        latitude: parseFloat(item.news_articles.latitude),
        longitude: parseFloat(item.news_articles.longitude )
      }));
      
    } catch (error) {
      console.error('Error fetching news from Supabase:', error);
      throw error;
    }
  };


/**
 * Fetches a single news event by ID
 * @param {string} id - The ID of the news item to fetch
 * @returns {Promise<Object>} - The requested news item
 */
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

/**
 * Searches for news events by keyword
 * @param {string} keyword - The keyword to search for
 * @returns {Promise<Array>} - Array of matching news events
 */
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

/**
 * Fetches news events filtered by theme
 * @param {string} theme - The theme to filter by
 * @returns {Promise<Array>} - Array of matching news events
 */
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

export default {
  fetchNewsFromSupabase,
  getNewsEventById,
  searchNewsEvents,
  getNewsByTheme
};



/**
 * Fetches news events from Supabase and formats them to match the application's data structure
 * @returns {Promise<Array>} - Array of news events in the required format
 */
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
        console.warn('No news data retrieved from Supabase');
        return [];
      }
      
      // Convert Supabase data to match the existing format
      // This assumes your Supabase table has the same column structure
      return data.map(item => ({
        name: item.name,
        country_id: item.country_id,
        flag_image_url: item.flag_image_url,
      }));
      
    } catch (error) {
      console.error('Error fetching news from Supabase:', error);
      throw error;
    }
  };