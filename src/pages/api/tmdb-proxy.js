// TMDB API Proxy to avoid CORS issues
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check if API key is configured
  if (!TMDB_API_KEY) {
    console.error('TMDB API key not found in environment variables');
    return res.status(500).json({ message: 'Server configuration error: TMDB API key not set' });
  }

  try {
    const { endpoint, ...params } = req.query;

    if (!endpoint) {
      return res.status(400).json({ message: 'Endpoint parameter is required' });
    }

    // Build the TMDB API URL
    let url = `${BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}`;
    
    // Add any additional query parameters
    Object.entries(params).forEach(([key, value]) => {
      url += `&${key}=${encodeURIComponent(value)}`;
    });

    console.log('TMDB Proxy: Requesting', url.replace(TMDB_API_KEY, 'API_KEY_HIDDEN'));
    
    // Make the request to TMDB
    const tmdbResponse = await fetch(url);
    
    if (!tmdbResponse.ok) {
      throw new Error(`TMDB API error: ${tmdbResponse.status}`);
    }
    
    // Get the response data
    const data = await tmdbResponse.json();
    
    // Return the data
    return res.status(200).json(data);
  } catch (error) {
    console.error('TMDB Proxy Error:', error);
    return res.status(500).json({
      message: 'Error fetching data from TMDB',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 