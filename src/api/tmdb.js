// TMDB API client
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/**
 * Simplified fetch function using our proxy API route
 * @param {string} endpoint - TMDB API endpoint path
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - Response data
 */
async function fetchTmdb(endpoint, params = {}) {
  try {
    // Build URL with query parameters
    let url = `/api/tmdb-proxy?endpoint=${encodeURIComponent(endpoint)}`;
    
    // Add any additional parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url += `&${key}=${encodeURIComponent(value)}`;
      }
    });
    
    console.log('TMDB: Requesting via proxy:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching from TMDB:', error);
    throw error;
  }
}

/**
 * Search for movies or TV shows by title
 * @param {string} query - The search query (title)
 * @param {string} type - Either 'movie' or 'tv'
 * @returns {Promise<Array>} - Search results
 */
export async function searchMedia(query, type = 'movie') {
  try {
    console.log(`TMDB: Searching for ${type} with query:`, query);
    
    const data = await fetchTmdb(`search/${type}`, {
      query,
      include_adult: false
    });
    
    console.log(`TMDB: Found ${data.results?.length || 0} results for search`);
    return data.results || [];
  } catch (error) {
    console.error('Error searching TMDB:', error);
    return [];
  }
}

/**
 * Get detailed information about a movie by ID
 * @param {string|number} id - The TMDB movie ID
 * @returns {Promise<Object|null>} - Movie details
 */
export async function getMovieDetails(id) {
  try {
    console.log('TMDB: Getting movie details for ID:', id);
    
    const data = await fetchTmdb(`movie/${id}`, {
      append_to_response: 'credits,videos,images'
    });
    
    console.log('TMDB: Successfully fetched movie details');
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
}

/**
 * Get detailed information about a TV show by ID
 * @param {string|number} id - The TMDB TV show ID
 * @returns {Promise<Object|null>} - TV show details
 */
export async function getTvDetails(id) {
  try {
    console.log('TMDB: Getting TV details for ID:', id);
    
    const data = await fetchTmdb(`tv/${id}`, {
      append_to_response: 'credits,videos,images'
    });
    
    console.log('TMDB: Successfully fetched TV details');
    return data;
  } catch (error) {
    console.error('Error fetching TV details:', error);
    return null;
  }
}

/**
 * Get the full image URL from a TMDB path
 * @param {string} path - Image path from TMDB
 * @param {string} size - Size of image (w500, original, etc.)
 * @returns {string} - Full image URL
 */
export function getImageUrl(path, size = 'w500') {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Search for media based on IMDb ID
 * @param {string|number} imdbId - IMDb ID (with or without 'tt' prefix)
 * @returns {Promise<Object|null>} - Media details if found
 */
export async function findByImdbId(imdbId) {
  try {
    // Early return if imdbId is null, undefined, or empty
    if (!imdbId) {
      console.error('TMDB: Invalid IMDb ID provided:', imdbId);
      return null;
    }

    // Ensure IMDb ID is a string
    let idStr = String(imdbId).trim();
    
    // Handle malformed IMDb IDs
    if (idStr.length === 0) {
      console.error('TMDB: Empty IMDb ID provided');
      return null;
    }
    
    // Ensure IMDb ID is properly formatted (should start with 'tt')
    let formattedId = idStr;
    if (!idStr.startsWith('tt')) {
      formattedId = `tt${idStr}`;
      console.log('TMDB: Formatted IMDb ID from', idStr, 'to', formattedId);
    }
    
    console.log('TMDB: Finding by IMDb ID:', formattedId);
    
    // Check if the formattedId seems valid (tt followed by at least 6-7 digits)
    const validImdbPattern = /^tt\d{6,9}$/;
    if (!validImdbPattern.test(formattedId)) {
      console.warn(`TMDB: IMDb ID "${formattedId}" does not match expected format`);
      // We'll still try to search, but log a warning
    }
    
    const data = await fetchTmdb('find/' + formattedId, {
      external_source: 'imdb_id'
    });
    
    console.log('TMDB: Find API response for', formattedId, 'received');
    
    // Useful for debugging
    if (!data.movie_results?.length && !data.tv_results?.length) {
      console.log('TMDB: No results found for IMDb ID', formattedId);
    }
    
    // Check if found in movie results
    if (data.movie_results && data.movie_results.length > 0) {
      console.log('TMDB: Found movie match for IMDb ID');
      return {
        ...data.movie_results[0],
        media_type: 'movie'
      };
    }
    
    // Check if found in TV results
    if (data.tv_results && data.tv_results.length > 0) {
      console.log('TMDB: Found TV show match for IMDb ID');
      return {
        ...data.tv_results[0],
        media_type: 'tv'
      };
    }
    
    console.log('TMDB: No matches found for IMDb ID:', formattedId);
    return null;
  } catch (error) {
    console.error('Error finding by IMDb ID:', error);
    return null;
  }
}

/**
 * Get the latest movies from TMDB
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of movies to return (max 20)
 * @returns {Promise<Array>} - List of latest movies
 */
export async function getLatestMovies(page = 1, limit = 10) {
  try {
    console.log(`TMDB: Fetching latest movies (page ${page}, limit ${limit})`);
    
    // Use the discover API to get recent movies sorted by release date
    const data = await fetchTmdb('discover/movie', {
      sort_by: 'release_date.desc',
      include_adult: false,
      include_video: false,
      page,
      'vote_count.gte': 100 // Only movies with at least 100 votes for better quality results
    });
    
    // For debugging
    console.log(`TMDB: Found ${data.results?.length || 0} latest movies`);
    
    // Return limited number of results
    return (data.results || []).slice(0, limit);
  } catch (error) {
    console.error('Error fetching latest movies:', error);
    return [];
  }
} 