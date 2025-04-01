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
export const fetchNewsFromSupabase = async () => {
  try {
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Check your environment variables.');
    }
    
    // Fetch news from Supabase table - adjust table name as needed
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .order('publication_date', { ascending: false });
    
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
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      author: item.author,
      newspaper: item.newspaper,
      theme: item.theme,
      themeTags: Array.isArray(item.themeTags) ? item.themeTags : (item.themeTags ? JSON.parse(item.themeTags) : []),
      image: item.image,
      externalLink: item.externalLink,
      publication_date: item.publication_date,
      location: item.location,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lng)
    }));
    
  } catch (error) {
    console.error('Error fetching news from Supabase:', error);
    throw error;
  }
};

/**
 * Creates a new news event in the Supabase database
 * @param {Object} newsItem - The news item to create
 * @returns {Promise<Object>} - The created news item
 */
export const createNewsEvent = async (newsItem) => {
  try {
    // Format theme tags if needed
    const formattedItem = {
      ...newsItem,
      themeTags: Array.isArray(newsItem.themeTags) 
        ? JSON.stringify(newsItem.themeTags) 
        : newsItem.themeTags
    };
    
    const { data, error } = await supabase
      .from('news_articles')
      .insert(formattedItem)
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating news event:', error);
    throw error;
  }
};

/**
 * Updates an existing news event in the Supabase database
 * @param {string} id - The ID of the news item to update
 * @param {Object} updates - The fields to update
 * @returns {Promise<Object>} - The updated news item
 */
export const updateNewsEvent = async (id, updates) => {
  try {
    // Format theme tags if needed
    const formattedUpdates = {...updates};
    if (updates.themeTags && Array.isArray(updates.themeTags)) {
      formattedUpdates.themeTags = JSON.stringify(updates.themeTags);
    }
    
    const { data, error } = await supabase
      .from('news_articles')
      .update(formattedUpdates)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating news event:', error);
    throw error;
  }
};

/**
 * Deletes a news event from the Supabase database
 * @param {string} id - The ID of the news item to delete
 * @returns {Promise<void>}
 */
export const deleteNewsEvent = async (id) => {
  try {
    const { error } = await supabase
      .from('news_articles')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting news event:', error);
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
      themeTags: Array.isArray(item.themeTags) ? item.themeTags : (item.themeTags ? JSON.parse(item.themeTags) : []),
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
      themeTags: Array.isArray(item.themeTags) ? item.themeTags : (item.themeTags ? JSON.parse(item.themeTags) : []),
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
  createNewsEvent,
  updateNewsEvent,
  deleteNewsEvent,
  getNewsEventById,
  searchNewsEvents,
  getNewsByTheme
};