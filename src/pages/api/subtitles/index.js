import { searchSubtitles } from '../../../api/db';

// API endpoint to search for subtitles
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Extract query parameters with defaults
    const {
      search = '',
      lang = '',
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Convert numeric parameters to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10) > 100 ? 100 : parseInt(limit, 10); // Limit to 100 max

    // Perform the search
    const results = await searchSubtitles({
      searchTerm: search,
      lang,
      page: pageNumber,
      limit: limitNumber,
      sortBy,
      sortOrder
    });

    // Return the results
    return res.status(200).json(results);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 